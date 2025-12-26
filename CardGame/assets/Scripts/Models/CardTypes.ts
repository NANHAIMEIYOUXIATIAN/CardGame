import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
// 卡牌花色枚举
export enum CardSuit {
    HEARTS = 'HEARTS',     // 红桃
    DIAMONDS = 'DIAMONDS', // 方块
    CLUBS = 'CLUBS',       // 梅花
    SPADES = 'SPADES'      // 黑桃
}

// 卡牌状态枚举
export enum CardState {
    COVERED = 'COVERED',   // 覆盖状态
    UNCOVERED = 'UNCOVERED' // 翻开状态
}

@ccclass('CardTypes')
export class CardTypes extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }
}


