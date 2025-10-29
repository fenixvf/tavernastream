import { Instagram, Twitter, Youtube, Facebook, Globe } from 'lucide-react';
import { SiTiktok, SiX } from 'react-icons/si';

export type SocialPlatform = 'instagram' | 'twitter' | 'x' | 'youtube' | 'facebook' | 'tiktok' | 'other';

export function detectSocialPlatform(url: string): SocialPlatform {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('instagram.com') || urlLower.includes('instagr.am')) {
    return 'instagram';
  }
  if (urlLower.includes('x.com')) {
    return 'x';
  }
  if (urlLower.includes('twitter.com') || urlLower.includes('t.co')) {
    return 'twitter';
  }
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'youtube';
  }
  if (urlLower.includes('facebook.com') || urlLower.includes('fb.com') || urlLower.includes('fb.me')) {
    return 'facebook';
  }
  if (urlLower.includes('tiktok.com')) {
    return 'tiktok';
  }
  
  return 'other';
}

interface SocialIconProps {
  platform: SocialPlatform;
  className?: string;
}

export function SocialIcon({ platform, className = "w-5 h-5" }: SocialIconProps) {
  switch (platform) {
    case 'instagram':
      return <Instagram className={className} />;
    case 'x':
      return <SiX className={className} />;
    case 'twitter':
      return <Twitter className={className} />;
    case 'youtube':
      return <Youtube className={className} />;
    case 'facebook':
      return <Facebook className={className} />;
    case 'tiktok':
      return <SiTiktok className={className} />;
    default:
      return <Globe className={className} />;
  }
}
