export const STAGE_NAMES: Record<number, string> = {
    1: 'Detection',
    2: 'Drafting',
    3: 'Planning',
    4: 'On Progress',
    5: 'Finalizing',
    6: 'Verification',
};

export const ROLE_STAGES: Record<string, string[]> = {
    Technician: ['Detection', 'Planning', 'On Progress'],
    Admin: ['Drafting', 'Finalizing'],
    Verifikator: ['Verification'],
};

export function getStageName(stageNumber: number): string {
    return STAGE_NAMES[stageNumber] || 'Unknown';
}

export function getStagesByRole(role: string): string[] {
    return ROLE_STAGES[role] || [];
}

export function getStageNumberByName(stageName: string): number | undefined {
    const entry = Object.entries(STAGE_NAMES).find(([_, name]) => name === stageName);
    return entry ? Number(entry[0]) : undefined;
}

export function getCurrentStage(finding: any): string {
    const histories = finding.finding_approval_histories;

    if (!Array.isArray(histories) || histories.length === 0) return 'Unknown';

    const currentIndex = histories.findIndex((history) => !history.verified_at);

    // Kalau semua tahap sudah diverifikasi
    if (currentIndex === -1) return 'Completed';

    // Gunakan STAGE_NAMES untuk ambil nama stage dari index
    const stageNumber = currentIndex + 1; // index dimulai dari 0, stage dari 1
    return STAGE_NAMES[stageNumber] ?? `Stage ${stageNumber}`;
}
