
import { Badge } from "@/components/ui/badge";
import { Briefcase, Github, Linkedin, ExternalLink } from "lucide-react";
import { ProfileActions } from "./profile-actions";
import { SquadProfile, MissionApplication } from "@prisma/client";
import { useTranslations } from "next-intl";

interface SquadProfileCardProps {
    profile: SquadProfile & { applications: MissionApplication[] };
}

export function SquadProfileCard({ profile }: SquadProfileCardProps) {
    const t = useTranslations("Squad");

    return (
        <div className="bg-zinc-900/40 border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all flex flex-col h-full group">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-base font-bold text-white leading-tight">{profile.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
                        <Briefcase className="w-3 h-3" />
                        <span>{profile.role}</span>
                    </div>
                </div>
                <Badge
                    variant="outline"
                    className={`
                        text-[10px] px-1.5 py-0.5 h-5
                        ${profile.status === 'vetted' ? 'border-green-500/30 text-green-500 bg-green-500/10' : ''}
                        ${profile.status === 'pending' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10' : ''}
                        ${profile.status === 'rejected' ? 'border-red-500/30 text-red-500 bg-red-500/10' : ''}
                    `}
                >
                    {profile.status.toUpperCase()}
                </Badge>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-2 mb-4 bg-black/20 p-2 rounded-lg border border-white/5">
                <div className="text-center">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">{t('exp')}</div>
                    <div className="text-sm font-bold text-white">{profile.yearsOfExp}Y</div>
                </div>
                <div className="text-center border-l border-white/5">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">{t('missions')}</div>
                    <div className="text-sm font-bold text-white">{profile.applications.length}</div>
                </div>
            </div>

            {/* Skills & Bio */}
            <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                    {profile.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="px-1.5 py-0.5 bg-zinc-800/50 rounded text-[10px] text-zinc-400 border border-zinc-700/50">
                            {skill}
                        </span>
                    ))}
                    {profile.skills.length > 3 && (
                        <span className="px-1.5 py-0.5 bg-zinc-800/50 rounded text-[10px] text-zinc-500 border border-zinc-700/50">
                            +{profile.skills.length - 3}
                        </span>
                    )}
                </div>

                {profile.bio && (
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed italic">
                        &quot;{profile.bio}&quot;
                    </p>
                )}
            </div>

            {/* Footer Actions */}
            <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                {/* Social Links */}
                <div className="flex gap-3 justify-center">
                    {profile.github && (
                        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-white transition-colors">
                            <Github className="w-4 h-4" />
                        </a>
                    )}
                    {profile.linkedin && (
                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-white transition-colors">
                            <Linkedin className="w-4 h-4" />
                        </a>
                    )}
                    {profile.portfolio && (
                        <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-white transition-colors">
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                </div>

                {/* Clearance Actions */}
                {profile.status === 'pending' ? (
                    <ProfileActions profileId={profile.id} />
                ) : (
                    <div className={`
                        text-center text-[10px] font-bold py-1.5 rounded bg-zinc-900 border border-zinc-800
                        ${profile.status === 'vetted' ? 'text-green-500' : 'text-red-500'}
                    `}>
                        {profile.status === 'vetted' ? t('cleared') : t('denied')}
                    </div>
                )}
            </div>
        </div>
    );
}
