import React from 'react';
import { Card } from '../ui/Card.tsx';
import { Heart, Calendar, Sparkles } from 'lucide-react';
import { formatDate } from '../../lib/utils.ts';

interface SuccessStoryCardProps {
  story: {
    id: number;
    title: string;
    story: string;
    brideName?: string | null;
    groomName?: string | null;
    marriageDate?: string | null;
    imageUrl?: string | null;
  };
  variant?: 'royal' | 'minimal' | 'elegant' | 'modern' | 'classic';
}

export const SuccessStoryCard: React.FC<SuccessStoryCardProps> = ({ story }) => {
  return (
    <Card
      className="group overflow-hidden rounded-2xl border-white/5 hover:border-white/20 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {story.imageUrl && (
          <div className="relative h-44 w-full overflow-hidden rounded-xl bg-[#151C32] mb-4">
            <img
              src={story.imageUrl}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#11182B] via-transparent to-transparent" />
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0B1124]/90 backdrop-blur-md border border-white/10 text-xs text-[#FBBF24] font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>قصة توفيق مباركة</span>
            </div>
          </div>
        )}

        <h4 className="text-sm sm:text-base font-bold font-heading text-white group-hover:text-[#A78BFA] transition-colors leading-snug mb-2">
          {story.title}
        </h4>

        <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-3 mb-4">{story.story}</p>
      </div>

      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#94A3B8]">
        <div className="flex items-center gap-1.5 text-[#FBBF24]">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span className="font-semibold text-white">
            {story.groomName && story.brideName
              ? `${story.groomName} & ${story.brideName}`
              : 'بارك الله لهما وبارك عليهما'}
          </span>
        </div>
        {story.marriageDate && (
          <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(story.marriageDate)}</span>
          </div>
        )}
      </div>
    </Card>
  );
};
