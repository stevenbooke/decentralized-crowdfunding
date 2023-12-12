;; title: crowdfunding
;; version: 1
;; summary: A decentralized crowdfunding application with data stored on-chain

;; contract version for testing
(define-constant contract-version u1)

;; contract owner
;; (define-constant contract-owner tx-sender)

;; error constants
(define-constant error-general (err u1))
(define-constant error-not-owner (err u2))
(define-constant error-campaign-does-not-exist (err u3))
(define-constant error-campaign-inactive (err u4))
(define-constant error-insufficient-balance (err u5))
(define-constant error-no-investment (err u6))
(define-constant error-campaign-already-funded (err u7))
(define-constant error-refund-stx-transfer-failed (err u8))
(define-constant error-target-not-reached (err u9))
(define-constant error-funding-stx-transfer-failed (err u10))
(define-constant error-already-funded (err u11))

;; current campaign ID nonce
(define-data-var campaign-id-nonce uint u0)

;; general information
(define-data-var total-campaigns-funded uint u0)
(define-data-var total-investments uint u0)
(define-data-var total-investment-value uint u0)

;; optional collection fee for contract-owner
;; (define-data-var contract-owner-collection-fee u0)

;; campaign information map
(define-map campaigns uint
	{
		name: (string-utf8 64),     ;; human-readable campaign name
		fundraiser: principal,      ;; the address that is fundraising (could be a contract?)
		goal: uint,                 ;; funding goal
		target-block-height: uint   ;; target block height
	}
)

;; campaign information
;; How should I choose the max-len of these string-utf8?
;; Consider url shortenting services, base62 ecnoding, and url length
(define-map campaign-information uint
	{
		description: (string-utf8 280),	;; campaign short description
		link: (string-utf8 150)			;; campaign URL
    }
)

;; campaign investments by principal
(define-map investments {campaign-id: uint, investor: principal}
	{
		amount: uint
	}
)

;; campaign aggregates
(define-map campaign-totals uint
	{
		total-investment: uint,
		total-investors: uint
    }
)

;; campaign status, whether the target was reached and at what block height
(define-map campaign-status uint
	{
		target-reached: bool,		    ;; was the target reached?
		target-reached-height: uint,    ;; block-height when it was reached
		funded: bool				    ;; did the fundraiser collect the funds?
    }
)

;; get the campaign ID nonce
(define-read-only (get-campaign-id-nonce)
	(ok (var-get campaign-id-nonce))
)

;; get total campaigns funded
(define-read-only (get-total-campaigns-funded)
	(ok (var-get total-campaigns-funded))
)

;; get total campaign investments
(define-read-only (get-total-investments)
	(ok (var-get total-investments))
)

;; get total campaign investment value
(define-read-only (get-total-investment-value)
	(ok (var-get total-investment-value))
)

;; get campaign
(define-read-only (get-campaign (campaign-id uint))
	(ok (unwrap! (map-get? campaigns campaign-id) error-campaign-does-not-exist))
)

;; get campaign information
(define-read-only (get-campaign-information (campaign-id uint))
	(ok (unwrap! (map-get? campaign-information campaign-id) error-campaign-does-not-exist))
)

;; get campaign totals
(define-read-only (get-campaign-totals (campaign-id uint))
	(ok (unwrap! (map-get? campaign-totals campaign-id) error-campaign-does-not-exist))
)

;; get campaign status
(define-read-only (get-campaign-status (campaign-id uint))
	(ok (unwrap! (map-get? campaign-status campaign-id) error-campaign-does-not-exist))
)

;; get if a campaign is active
(define-read-only (get-is-active-campaign (campaign-id uint))
	(let (
            (campaign (unwrap! (map-get? campaigns campaign-id) error-campaign-does-not-exist))
            (status (unwrap! (map-get? campaign-status campaign-id) error-campaign-does-not-exist))
		)
	    (ok (and (< block-height (get target-block-height campaign)) (not (get target-reached status))))
	)
)

;; create a new campaign for fundraising
;; it stores a little bit of information in the contract so that
;; there is a single source of truth.
;; a fundraiser should set a campaign name, description, goal in mSTX,
;; and duration in blocks.
(define-public (create-campaign (name (string-utf8 64)) (description (string-utf8 280)) (link (string-utf8 150)) (goal uint) (duration uint))
	(let ((campaign-id (+ (var-get campaign-id-nonce) u1)))
		(asserts! (and
                    (map-set campaigns campaign-id
                        {
                            name: name,
                            fundraiser: tx-sender,
                            goal: goal,
                            target-block-height: (+ duration block-height)
                        }
                    )
                    (map-set campaign-information campaign-id
                        {
                            description: description,
                            link: link
                        }
                    )
                    (map-set campaign-totals campaign-id
                        {
                            total-investment: u0,
                            total-investors: u0
                        }
                    )
                    (map-set campaign-status campaign-id
                        {
                            target-reached: false,
                            target-reached-height: u0,
                            funded: false
                        }
                    )
                )
                error-general
        )
        (var-set campaign-id-nonce campaign-id)
        (ok campaign-id)
	)
)

;; updates campaign information (description and link)
;; owner only
(define-public (update-campaign-information (campaign-id uint) (description (string-utf8 280)) (link (string-utf8 150)))
	(let ((campaign (unwrap! (map-get? campaigns campaign-id) error-campaign-does-not-exist)))
		(asserts! (is-eq (get fundraiser campaign) tx-sender) error-not-owner)
		(map-set campaign-information campaign-id
			{
				description: description,
				link: link
            }
        )
		(ok true)
	)
)

;; invest in a campaign
;; transfers stx from tx-sender to the contract
(define-public (invest (campaign-id uint) (amount uint))
	(let (
            (campaign (unwrap! (map-get? campaigns campaign-id) error-campaign-does-not-exist))
            (status (unwrap! (map-get? campaign-status campaign-id) error-campaign-does-not-exist))
            (total (unwrap! (map-get? campaign-totals campaign-id) error-campaign-does-not-exist))
            (prior-investment (default-to u0 (get amount (map-get? investments {campaign-id: campaign-id, investor: tx-sender}))))
            (new-campaign-total (+ (get total-investment total) amount))
		)
		(asserts! (and (< block-height (get target-block-height campaign)) (not (get target-reached status))) error-campaign-inactive)
		(unwrap! (stx-transfer? amount tx-sender (as-contract tx-sender)) error-insufficient-balance)
        (asserts! (and
                    (map-set campaign-totals campaign-id 
                        {
                            total-investment: new-campaign-total,
                            total-investors: (if (> prior-investment u0)
                                                (get total-investors total)
                                                (+ (get total-investors total) u1)
                            )
                        }
                    )
                    (map-set investments {campaign-id: campaign-id, investor: tx-sender}
                        {
                            amount: (+ amount prior-investment)
                        }
                    )
                )
            error-general
        )
        (var-set total-investments (+ (var-get total-investments) u1))
        (var-set total-investment-value (+ (var-get total-investment-value) amount))
        (if (>= new-campaign-total (get goal campaign))
            (begin
                (map-set campaign-status campaign-id
                    {
                        target-reached: true,
                        target-reached-height: block-height,
                        funded: false
                    }
                )
                (var-set total-campaigns-funded (+ (var-get total-campaigns-funded) u1))
                (ok true) ;; funded and target reached
            )
            (ok true) ;; else: funded but target not yet reached
        )
    )
)


;; refund an investment
;; can only refund if the investment target has not been reached
;; transfers stx from the contract to the tx-sender
(define-public (refund (campaign-id uint))
	(let (
            (campaign (unwrap! (map-get? campaigns campaign-id) error-campaign-does-not-exist))
            (status (unwrap! (map-get? campaign-status campaign-id) error-campaign-does-not-exist))
            (total (unwrap! (map-get? campaign-totals campaign-id) error-campaign-does-not-exist))
            (prior-investment (default-to u0 (get amount (map-get? investments {campaign-id: campaign-id, investor: tx-sender}))))
            (new-campaign-total (- (get total-investment total) prior-investment))
            (original-tx-sender tx-sender)
		)
		(asserts! (not (get target-reached status)) error-campaign-already-funded)
		(asserts! (> prior-investment u0) error-no-investment)
		(unwrap! (as-contract (stx-transfer? prior-investment tx-sender original-tx-sender)) error-refund-stx-transfer-failed)
        (asserts! 
            (map-set campaign-totals campaign-id 
                {
                    total-investment: new-campaign-total,
                    total-investors: (- (get total-investors total) u1)
                }
            )
            error-general
        )
        (var-set total-investments (- (var-get total-investments) u1))
        (var-set total-investment-value (- (var-get total-investment-value) prior-investment))
        (ok true)
    )
)

;; fund a campaign
;; this sends the raised funds to the fundraiser
;; only works if the goal was reached within the specified duration
;; TODO: transfer optional collection fee to contract-owner
(define-public (collect (campaign-id uint))
	(let (
            (campaign (unwrap! (map-get? campaigns campaign-id) error-campaign-does-not-exist))
            (status (unwrap! (map-get? campaign-status campaign-id) error-campaign-does-not-exist))
            (total (unwrap! (map-get? campaign-totals campaign-id) error-campaign-does-not-exist))
            (original-tx-sender tx-sender)
		)
		(asserts! (is-eq (get fundraiser campaign) tx-sender) error-not-owner)
		(asserts! (not (get funded status)) error-already-funded)
		(asserts! (get target-reached status) error-target-not-reached)
		(unwrap! (as-contract (stx-transfer? (get total-investment total) tx-sender original-tx-sender)) error-funding-stx-transfer-failed)
		(asserts! (map-set campaign-status campaign-id
			{
				target-reached: true,
				target-reached-height: (get target-reached-height status),
				funded: true
            }
		) error-general)
		(ok true)
	)
)
