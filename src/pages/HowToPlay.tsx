import AppLayout from "../layout/AppLayout";
import image from "../assets/image.png";
import { Link } from "react-router-dom";

interface StepProps {
  number: number;
  title: string;
  description: string;
  image: string;
  reverse?: boolean;
}

function Step({
  number,
  title,
  description,
  image,
  reverse = false,
}: StepProps) {
  return (
    <div
      className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 mb-16`}
    >
      <div className="flex-1">
        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-satoshi text-xl">
              {number}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white font-satoshi">
                {title}
              </h3>
              <p className="text-gray-300 font-satoshi">{description}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <img
          src={image}
          alt={title}
          className="w-full h-auto rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
}

export default function HowToPlay() {
  return (
    <AppLayout>
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 md:pt-16 pt-8 pb-32 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-12 text-center font-satoshi">
            How to Play
          </h1>

          <div className="space-y-16">
            <Step
              number={1}
              title="Daily Challenge"
              description="Log in every day to discover a new location challenge. You'll have 30 seconds to guess where the image was taken. Use your geographical knowledge and observation skills to make your best guess!"
              image={image}
            />

            <Step
              number={2}
              title="Location Quiz"
              description="After making your guess, you'll be presented with a 3-question multiple choice quiz about the location. Test your knowledge about the local culture, geography, and interesting facts!"
              image={image}
              reverse
            />

            <Step
              number={3}
              title="Earn Badges"
              description="Complete the challenge and quiz to earn unique badges. These badges are organized into collections based on continents, regions, and special categories. Build your collection and show off your achievements!"
              image={image}
            />

            <Step
              number={4}
              title="Mint Your Achievements"
              description="Once you've earned a badge, you can mint it as a unique NFT. These digital collectibles represent your progress and achievements in the game. Start your collection today!"
              image={image}
              reverse
            />
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-white mb-4 font-satoshi">
              Ready to test your geography knowledge?
            </h2>
            <p className="text-gray-300 mb-8 font-satoshi">
              Click the button below to start your first game!
            </p>
            <Link
              to="/play"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors font-satoshi cursor-pointer"
            >
              Start Game
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
