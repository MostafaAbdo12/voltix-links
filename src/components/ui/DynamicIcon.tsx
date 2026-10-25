'use client';

import React from 'react';
import {
  Globe,
  Sparkles,
  ExternalLink,
  ShoppingBag,
  Youtube,
  Music,
  Video,
  Camera,
  Code,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Award,
  Heart,
  Star,
  Zap,
  Flame,
  Gamepad2,
  Headphones,
  Mic,
  Send,
  MessageCircle,
  Download,
  FileText,
  Coffee,
  Gift,
  CreditCard,
  Rocket,
  Crown,
  Gem,
  Palette,
  Terminal,
  Cpu,
  Layers,
  Compass,
  Play,
  Share2,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  Sparkles,
  ExternalLink,
  ShoppingBag,
  Youtube,
  Music,
  Video,
  Camera,
  Code,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Award,
  Heart,
  Star,
  Zap,
  Flame,
  Gamepad2,
  Headphones,
  Mic,
  Send,
  MessageCircle,
  Download,
  FileText,
  Coffee,
  Gift,
  CreditCard,
  Rocket,
  Crown,
  Gem,
  Palette,
  Terminal,
  Cpu,
  Layers,
  Compass,
  Play,
  Share2,
};

export const AVAILABLE_LINK_ICONS = Object.keys(ICON_MAP);

export function DynamicIcon({
  name,
  className = 'w-5 h-5',
}: {
  name?: string;
  className?: string;
}) {
  const IconComponent = (name && ICON_MAP[name]) || Globe;
  return <IconComponent className={className} />;
}

