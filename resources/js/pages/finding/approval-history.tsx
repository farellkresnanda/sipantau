'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo } from 'react';
import VerifyDialog from '@/pages/finding/verify-dialog';

type ApprovalHistorySectionProps = {
    finding: any; // Ganti dengan tipe yang tepat
};

const ApprovalHistorySection = ({ finding }: ApprovalHistorySectionProps) => {
    const filteredApprovals = useMemo(() => {
        const userMap = new Map<string, any[]>();

        for (const approval of finding.finding_approval_histories || []) {
            const assignment = approval.finding_approval_assignment?.[0];
            const userId = assignment?.user?.id;

            if (!userId) continue;

            if (!userMap.has(userId)) {
                userMap.set(userId, []);
            }

            userMap.get(userId)?.push(approval);
        }

        const result: any[] = [];

        for (const [_, approvals] of userMap) {
            const verified = approvals.filter((a) => a.verified_at != null);
            const sorted = approvals.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

            if (verified.length > 0) {
                // Tampilkan approval terakhir yang sudah diverifikasi
                const latestVerified = verified.sort((a, b) => new Date(b.verified_at).getTime() - new Date(a.verified_at).getTime())[0];
                result.push(latestVerified);
            } else {
                // Tampilkan approval paling awal
                result.push(sorted[0]);
            }
        }

        return result;
    }, [finding.finding_approval_histories]);

    const badgeStyleMap: Record<string, { variant: 'default' | 'secondary' | 'destructive'; className: string }> = {
        APPROVED: {
            variant: 'secondary',
            className: 'bg-green-50 text-green-700 border-green-500 border',
        },
        FINISHED: {
            variant: 'secondary',
            className: 'bg-green-50 text-green-700 border-green-500 border',
        },
        ON_PROGRESS: {
            variant: 'secondary',
            className: 'bg-yellow-50 text-yellow-700 border-yellow-500 border',
        },
        EFFECTIVE: {
            variant: 'secondary',
            className: 'bg-green-50 text-green-700 border-green-500 border',
        },
        CLOSE: {
            variant: 'secondary',
            className: 'bg-green-50 text-green-700 border-green-500 border',
        },
        REJECTED: {
            variant: 'destructive',
            className: 'bg-red-500 hover:bg-red-600 text-white',
        },
        DEFAULT: {
            variant: 'default',
            className: 'bg-gray-500 hover:bg-gray-600 text-white',
        },
    };

    return (
        <div className="space-y-3">
            <Card>
                <CardContent className="space-y-4">
                    <h3 className="text-lg font-semibold">Riwayat Approval</h3>
                    <div className="grid gap-6">
                        {filteredApprovals.length > 0 ? (
                            filteredApprovals.map((approval, index) => {
                                const assignment = approval.finding_approval_assignment?.[0];
                                const userName = assignment?.user?.name ?? '-';
                                const status = approval.approval_status || 'DEFAULT';
                                const { variant, className } = badgeStyleMap[status] ?? badgeStyleMap.DEFAULT;

                                return (
                                    <div key={index} className="flex items-center gap-4">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/micah/svg?seed=${approval.stage}`} />
                                            <AvatarFallback>{userName?.[0] ?? '?'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-1 items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <p className="text-sm leading-none font-medium">{userName}</p>
                                                <p className="text-muted-foreground text-sm italic">({approval.stage})</p>
                                                <Badge variant={variant} className={`text-xs ${className}`}>
                                                    {approval.approval_status}
                                                </Badge>
                                            </div>
                                            <div className="text-muted-foreground ml-auto text-right text-sm whitespace-nowrap">
                                                {approval.verified_at ? (
                                                    <>
                                                        <div className="flex items-center justify-end gap-1">
                                                            <CheckCircle className="h-4 w-4" />
                                                            {format(new Date(approval.verified_at), 'dd-MM-yyyy')}
                                                        </div>
                                                        <div className="text-xs">
                                                            {format(new Date(approval.verified_at), 'HH:mm')} WIB
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400">Belum diverifikasi</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-muted-foreground text-sm">Tidak ada riwayat approval.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Tombol Verifikasi */}
            <div className="flex gap-2">
                <VerifyDialog finding={finding} />
            </div>
        </div>
    );
};

export default ApprovalHistorySection;
