import AppLayout from "../layout/AppLayout";
import { Link } from "react-router-dom";
import newGameImage from "../assets/new_game.png";
import locationQuizImage from "../assets/location_quiz.png";
import mintBadgeImage from "../assets/mint_badge.png";

interface StepProps {
  number: number;
  title: string;
  description: string;
  image?: string;
}

function Step({ number, title, description, image }: StepProps) {
  return (
    <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-white/10">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-satoshi text-xl">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white font-satoshi mb-2">
            {title}
          </h3>
          <p className="text-gray-300 font-satoshi">{description}</p>
        </div>
      </div>
      {image && (
        <div className="mt-4 rounded-lg overflow-hidden">
          <img src={image} alt={title} className="w-full h-auto" />
        </div>
      )}
    </div>
  );
}

export default function HowToPlay() {
  const steps: Omit<StepProps, "number">[] = [
    {
      title: "Start a New Game",
      description:
        "Begin by clicking the 'Play' button. A random Street View location will appear. Pan around to find clues!",
      image: newGameImage,
    },
    {
      title: "Guess the Location & Answer a Quiz",
      description:
        "Drop a pin on the world map to guess the location. Afterwards, test your knowledge with a 3-question quiz about the area!",
      image: locationQuizImage,
    },
    {
      title: "See Your Score & Mint Your Badge",
      description:
        "Your final score is based on how close your guess was. You'll also get to mint a unique badge for completing the game!",
      image: mintBadgeImage,
    },
  ];

  return (
    <AppLayout>
      <div className="self-start mt-10">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white text-center">
            How to Play
          </h1>
          <p className="text-lg text-white/80 mt-4">Scroll down to learn more</p>
        </div>

        {/* Content Section */}
        <div className="relative z-10 rounded-t-3xl mt-12 pt-12 ">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {steps.map((step, index) => (
              <Step key={index} number={index + 1} {...step} />
            ))}

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
      </div>
    </AppLayout>
  );
}
