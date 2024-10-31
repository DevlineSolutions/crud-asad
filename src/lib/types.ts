export type Instruction = {
    id: number;
    title: string;
    description: string;
    duration: number;
    previewFile: string;
    steps: Step[];
    assets: InstructionAsset[];
    createdBy: number;
    updatedBy: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    deletedBy?: number | null;
};

export type Step = {
    id: number;
    type: string;
    title: string;
    description: string;
    stepNr: number;
    attachedFile?: string | null;
    instructionId: number;
    instruction: Instruction;
    createdBy: number;
    updatedBy: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    deletedBy?: number | null;
};

export type Asset = {
    id: number;
    name: string;
    assetFiles: string[]; // array of file paths or URLs
    instructions: InstructionAsset[];
    createdBy: number;
    updatedBy: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    deletedBy?: number | null;
};

export type InstructionAsset = {
    instructionId: number;
    assetId: number;
    instruction: Instruction;
    asset: Asset;
};

export type User = {
    id: number;
    name: string;
};
