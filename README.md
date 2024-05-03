

## Inspiration

When you think of generative AI, one of the last things that comes to mind is a game. As we are all avid gamers ourselves, we decided to tackle that challenge head on and build a fun game for our friends. When brainstorming and experimenting with the AI, we realized that there were evident "limitations" of generative AI, especially with creative work. Often times, AI text would produce text that was over the top, unrealistic, and overall whacky. Instead of seeing this as a limitation however, we decided to play into that and use that to our advantage...

What if instead of trying to make AI sound as creative and sophisticated as humans, we challenged ourselves to write as silly and unpredictable as AI? That's how TR.AI.TOR was born!

TR.AI.TOR is an imposter style game, inspired by many other casual deception party games such as Among Us and Spyfall. Our greatest inspiration easily comes from Jackbox Party Pack games, as they influenced much of our gameplay patterns and design.

## What it does

A typical game of TR.AI.TOR looks like this:
1. Players pick a randomly generated character from a list. This will be their "AI Translator". However, there is on Traitor who **_doesn't_** get a character.
2.  Each round, the players all get the same interesting question prompt, in which they answer truthfully. 
3. These answers are then translated by their AI character to yield goofy versions of their answers
4. The traitor, on the other hand, doesn't get an AI character to help translate. It's up to them to come up with something silly **_themselves_** to blend in with the rest of the AI answers
5. The answers are showcased and the players discuss who to vote as the traitor! If you're innocent, try to keep track of potential character answers. If you're a traitor, get ready to lie like your life depends on it!
6. The game ends once the traitor survives a certain number of rounds, or if the innocents successfully vote them out.

## How we built it

We built this app using React.js for the frontend and Node.js, Express.js, and Socket.io for the backend. 

We decided on this tech stack because we really wanted to make this game as accessible as possible. This was something we liked about Jackbox Party Pack games. Casual games shouldn't have a steep entry curve, which is why allowing users to play on a browser or even a mobile device was something we really wanted to ensure. 

We used sockets because when we researched other web app games such as Spyfall, Skribble, and Codenames, they all seemed to use sockets as a convenient way to manage rooms and room communications. 

## Challenges we ran into

One of the bigger challenges we ran into regarding the AI was trying to effectively prompt engineer for our use case. We wanted to make sure that the AI model would simply translate player's text without behaving as an AI model responding to prompts. This took a lot of trial and error, and even now it isn't perfect but it is a lot more consistent thanks to some of the features of our prompt:
1. We emphasized to the AI model that at no point should it break character, and it should simply translate all text
2. We gave the AI model a fallback clause, stating that if it didn't understand something it was free to make up some text about the weather
3. We provided all the preliminary information about the translation before providing the text to be translated. This allowed the AI to have context for translating before going through with the task.

We believe this series of features within our prompts allowed us to yield better results than before and we're happy with the result overall. Future considerations can include using a training dataset to fine tune the AI responses to be more fitted towards the game.

In terms of non-AI related challenges, a lot of the front end was difficult for us as we're not UX designers nor front end experts. We decided to lean into a simpler art style for both our sakes, and to compliment the light hearted fun of the game. 

## Accomplishments that we're proud of

One of the biggest accomplishments we're proud of is that we were able to make a game that not only acts as a great submission for this Hackathon, but also a fun party game for our friends. We have a rather large friend group and are always looking for casual games to play either together in person or together over Discord so being able to create another fun experience for us is a great feeling that we're all very much proud of. 

Another thing we're proud of is the fact that we were able to integrate the AI in a way that was intuitive and fun. Making a game that uses AI is not an easy task, and the ideation phase of our project took many days. A lot of brainstorming, back and forth discussions, and whiteboarding went into developing an idea for a fun and simple game that makes use of generative AI. When we finally landed on the concept of TR.AI.TOR, we knew we had a winning game idea which we could make into something that we're proud of.

## What we learned

One thing we learned was how finnicky AI can be, but in a good way. While AI is extremely capable, it can only be as good as it is instructed. We learned how to effectively prompt engineer to get more accurate and desirable results, which is something very important when working with generative AI models.

We also learned a lot about Socket.io, completely from scratch! We learned about sockets briefly before in classes, but being able to really apply it in a practical setting gave us a much better understanding and appreciation for its capabilities. 

## What's next for TR.AI.TOR

As this was a project with time constraints and we all either work full time jobs or are full time students, dedicating enough time into TR.AI.TOR was difficult. This meant limiting our scope to core features and fixing critical bugs exclusively. In the future, we would love to tackle all the known bugs that we've kept track of.

Additionally, we have a plethora of features and power ups that we want to add which would result in a more variety.

Finally, we would love to give TR.AI.TOR a complete UI overhaul now that we won't have a deadline, so we can take our time to become proficient front end developers. We had a few design choices that would have greatly enhanced responsiveness and accessibility, but we had to avoid focusing on them due to time constraints.

Given more time and resources, we'd love to fully flesh out TR.AI.TOR as we believe it can become a great casual party game and a classic example of AI driven games.
