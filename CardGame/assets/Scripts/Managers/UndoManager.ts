export interface IGameOperation {
    type: 'MOVE_TO_BOTTOM' | 'DRAW_CARD' | 'FLIP_CARD';
    card: any;
    from: string;
    to: string;
    timestamp: number;
}

export class UndoManager {
    private operations: IGameOperation[] = [];
    private maxHistory = 20;

    // 记录操作
    recordOperation(operation: IGameOperation): void {
        this.operations.push(operation);
        
        // 限制历史记录数量
        if (this.operations.length > this.maxHistory) {
            this.operations.shift();
        }
        
        console.log(`UndoManager: 记录操作 ${operation.type}`);
    }

    // 撤销操作
    undo(): IGameOperation | null {
        if (this.operations.length === 0) {
            return null;
        }
        
        const operation = this.operations.pop();
        console.log(`UndoManager: 撤销操作 ${operation?.type}`);
        return operation || null;
    }

    // 是否可以撤销
    canUndo(): boolean {
        return this.operations.length > 0;
    }

    // 清空历史
    clear(): void {
        this.operations = [];
        console.log('UndoManager: 清空操作历史');
    }

    // 获取操作数量
    getOperationCount(): number {
        return this.operations.length;
    }
}