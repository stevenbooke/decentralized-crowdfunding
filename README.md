# Welcome to the Trust Machines Interview!
The goal of this project is to test your system design and coding skills as well as the ability to take a complicated task and translate it into an actionable design document that can lead future engineering efforts.

This project consists of:
1. A system design document
2. A coding task translating some of the design document into a working prototype
## 1. Process

***This interview is designed to simulate a real life project setting in a compressed timeline so that we can get an idea of how you will navigate your day to day work life here at Trust Machines.*** You are going to have a group chat with the interviewing panel that are there to answer any and all questions you have (technical, clarifying or any other kinds of questions) and we encourage you to use it liberally. Please ask questions about the problem as well as potential design discussions you might want to land on, or simply if you are stuck on a bug that you can't seem to figure out. We ping each other all the time when we are stuck on technical problems!

***The system design document should be the first thing you work on and complete.*** This question is open-ended and has a lot of scope (just like all real world engineering problems) and we are very curious to see how you navigate this ambiguity. We do not expect you to design a complete 100% solution, just that you can deal with hard real world problems. Once you are done with the design document, please ping the group so that we can look over it and help you through anything that might need reconsideration or elaboration.

The design document, if you have never written one before, is sort of like a map of the problem statement and how you plan to navigate that on the codebase - it should include a summary of the things you have considered to come up with the current design, any trade offs that were made, any public functions or APIs that other programmers might be interfacing with, and defining the scope of the current implementation and future work (including any areas for future optimizations). If you want to run benchmarks on certain parts of the code that you write, that should go in the future work section as well. In short, a design document should be a first stop for anyone trying to navigate your part of the codebase and contribute to it. Its purpose is to serve as a map to guide them through the terrain of the code.

If you don't know what a design document should look like, here is a design document we worked on internally defining an API: [example](https://docs.google.com/document/d/1DyHleiy7R_Znki85tf307H8NCpt0_hv4oLyHIgkEM4U/edit?usp=sharing)

***You do NOT need to implement everything - choose a portion of the design and implement it.*** In fact, you don't even need to implement all of the implementation details highlighted in the design document. We highly encourage a barebones first approach to coding while translating the design document to code. We just want to make sure that you know how to effectively translate the roadmap laid out in the design document into a concrete solution.

## 2. Problem
We are looking to implement a simple crowdfunding solution that lets projects raise capital from diverse sources. So a project manager looking to raise money for their project can:

1. Start a campaign (including saving details of the campaign that contributors might want to look at before contributing)
2. Be able to edit campaign details
3. Set a crowdfunding goal
4. Set a crowdfunding deadline
5. If a campaign goal is met, be able to post updates for their donors to see
6. Set any rewards that might be applicable for contributing some specific amounts (optional)

The other users of the platform are the contributors. They should have be able to:

1. Have access to all campaigns currently running
2. Donate a specific amount to a campaign
3. If the crowdfunding goal isn't met, get a full refund
4. If a vote of no confidence is passed, get a proportional refund (explained in the next section)
5. Get any rewards they are entitled to if the goals are met

The system itself has a few quirks:

1. If a campaign is funded, the entire amount isn't distributed all at once, but in installments
2. Before an installment is unlocked, the donors should have an option to pass a vote of no-confidence if they believe that the campaign no longer embodies the project they contributed to. This can be a simple majority vote or a weighted vote based on donation proportions (you do not have to implement the voting mechanism, just think about the design decisions choosing one or the other would imply)
3. If a vote of no confidence is passed, the campaign is immediately canceled and the leftover money raised should be refunded proportionally to the donors.

***Since we mainly work with crypto (especially Bitcoin) it would be great if some of the design decisions you make to implement these features took into account the constraints around Bitcoin.*** If you don’t have prior Blockchain experience, this is a great time to read into it!

## 3. Deliverables
Since this task is open ended, the biggest deliverable is the design document. In terms of implementation, be sure that at least a few of the stories for each of the aspects (project managers, donors, system) are implemented and for the ones that are not, that there is a clearly implementable path forward laid out in the design document.

***We expect you to share a design document with the team some time before the end of the project to validate your approach and assumptions, and the team will aim to get feedback to you within 24 hrs.***

For the paths/stories you do implement, please have some basic unit tests that simulate how you would have unit tests per PR submitted implementing a single feature. We would rather you implement less features and show us how you navigate the end to end development pipeline than implement a lot of features that don't translate over well to a real life project setting.

We will create a Github project for you where you should commit frequently and should be the point of contact to review the design document and the current state of implementation.

You can choose to implement this project in any programming language you like, just tell us how to run the stack in the Github README when you submit your solution (just like a real world project).

## 4. Conclusion
Please don't get overwhelmed with the scope of the project! ***We know it's a lot and we do not expect complete solutions.*** We are also here to work with you to get to the design and solution. This is very much a collaborative process and we want to see you succeed. If you need any help with anything, please don't hesitate to ask the panel at any point and we will work through it together just like we would in a real world setting.

