import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { twMerge } from 'tailwind-merge';

// Import all animations
const animations = {
  haircut: require('/public/animations/Haircut.json'),
  shavingFoam: require('/public/animations/Shaving Foam.json'),
  hairWashing: require('/public/animations/Hair Washing.json'),
  hairdryer: require('/public/animations/Hairdryer.json'),
  razor: require('/public/animations/Razor.json'),
  comb: require('/public/animations/Comb.json'),
  electricShaver: require('/public/animations/Electric Shaver.json'),
  beardTrimmer: require('/public/animations/Beard Trimmer.json'),
  razorBlade: require('/public/animations/Razor Blade.json'),
  barberChair: require('/public/animations/Barber Chair.json'),
  shavingBrush: require('/public/animations/Shaving Brush.json'),
  barberShop: require('/public/animations/Barber Shop.json'),
  barberScissors: require('/public/animations/Barber Scissors.json'),
} as const;

type AnimationKey = keyof typeof animations;

// Update colors to match theme
const colorReplacements = {
  // Original blue color to theme blue
  'rgb(113,112,208)': 'rgb(59,130,246)', // theme blue-500
  'rgb(71,70,130)': 'rgb(29,78,216)', // theme blue-700
  
  // Original teal color to theme color
  'rgb(69,213,204)': 'rgb(59,130,246)', // theme blue-500
  'rgb(43,133,127)': 'rgb(29,78,216)', // theme blue-700
};

interface LoadingAnimationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingAnimation({ className, size = 'md' }: LoadingAnimationProps) {
  const [selectedAnimation, setSelectedAnimation] = useState<typeof animations[AnimationKey] | null>(null);

  useEffect(() => {
    // Randomly select an animation on mount
    const animationKeys = Object.keys(animations) as AnimationKey[];
    const randomKey = animationKeys[Math.floor(Math.random() * animationKeys.length)];
    setSelectedAnimation(animations[randomKey]);
  }, []);

  if (!selectedAnimation) return null;

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  } as const;

  return (
    <div className={twMerge(
      'flex items-center justify-center',
      sizeClasses[size],
      className
    )}>
      <Lottie
        animationData={selectedAnimation}
        loop={true}
        autoplay={true}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
} 