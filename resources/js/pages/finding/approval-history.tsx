'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo } from 'react';
import VerifyDialog from '@/pages/finding/verify-dialog';
import {getCurrentStage} from "@/lib/stages";

type ApprovalHistorySectionProps = {
    finding: any; // Ganti dengan tipe yang tepat
};

const ApprovalHistorySection = ({ finding }: ApprovalHistorySectionProps) => {
    const filteredApprovals = useMemo(() => {
        const approvals = [...(finding.finding_approval_histories || [])].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        const skipMap = new Set();

        // Cari semua yang sudah ON_PROGRESS
        approvals.forEach((a) => {
            if (a.approval_status === 'ON_PROGRESS') {
                const assignment = a.finding_approval_assignment?.[0];
                if (assignment) {
                    const key = `${assignment.user?.id}-${assignment.role}-${a.stage}`;
                    skipMap.add(key);
                }
            }
        });

        // Filter ulang: hilangkan status ON_PROGRESS kalau sudah ada FINISHED dengan kombinasi yang sama
        return approvals.filter((a) => {
            const assignment = a.finding_approval_assignment?.[0];
            if (!assignment) return true;

            const key = `${assignment.user?.id}-${assignment.role}-${a.stage}`;

            if (
                a.approval_status === 'ON_PROGRESS' &&
                skipMap.has(key)
            ) {
                return false;
            }

            return true;
        });
    }, [finding.finding_approval_histories]);

    console.log(filteredApprovals)

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
        WAITING: {
            variant: 'secondary',
            className: 'bg-purple-50 text-purple-700 border-purple-500 border',
        },
        REJECTED: {
            variant: 'destructive',
            className: 'bg-red-500 hover:bg-red-600 text-white',
        },
        DEFAULT: {
            variant: 'default',
            className: 'bg-gray-50 text-gray-700 border-gray-500 border',
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
                                const roleName = assignment?.user.role[0].name
                                const stageName = getCurrentStage(finding);
                                const status = stageName === approval.stage ? 'WAITING' : approval.approval_status || 'DEFAULT';
                                const { variant, className } = badgeStyleMap[status] ?? badgeStyleMap.DEFAULT;

                                return (
                                    <div key={index} className="flex items-center gap-4">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(userName || '')}`} />
                                            <AvatarFallback>{userName?.[0] ?? '?'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-1 items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <p className="text-sm leading-none font-medium">{userName}</p>
                                                <p className="text-muted-foreground text-xs">({roleName}) - ({approval.stage})</p>
                                                <Badge variant={variant} className={`text-xs ${className}`}>
                                                    {stageName === approval.stage ? 'WAITING' : approval.approval_status}
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
                                                    <span className="text-gray-400">Menunggu..</span>
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
