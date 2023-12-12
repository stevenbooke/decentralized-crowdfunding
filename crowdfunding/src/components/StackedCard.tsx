import {
  UserData
} from "@stacks/connect";
import { Campaign } from '../App';

type CardProps = {
  userData: UserData | undefined,
  campaign: Campaign,

}

function StackedCard({userData, campaign }: CardProps) {

  return (
    <li className="max-w-sm rounded overflow-hidden shadow-lg">
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{campaign.name}</div>
        <p className="text-gray-700 text-base">{campaign.description}</p>
      </div>
  </li>
  );
}

export default StackedCard;