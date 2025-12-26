export enum CardSuit {
    HEARTS = 'HEARTS',
    DIAMONDS = 'DIAMONDS', 
    CLUBS = 'CLUBS',
    SPADES = 'SPADES'
}

export enum CardState {
    COVERED = 'COVERED',
    UNCOVERED = 'UNCOVERED'
}

export class Card {
    number: number;
    suit: CardSuit;
    state: CardState;

    constructor(number: number, suit: CardSuit, state: CardState = CardState.COVERED) {
        this.number = number;
        this.suit = suit;
        this.state = state;
    }

    getDisplayName(): string {
        let numStr: string;
        switch (this.number) {
            case 1: numStr = 'A'; break;
            case 11: numStr = 'J'; break;
            case 12: numStr = 'Q'; break;
            case 13: numStr = 'K'; break;
            default: numStr = this.number.toString();
        }
        
        let suitSymbol: string;
        switch (this.suit) {
            case CardSuit.HEARTS: suitSymbol = '♥'; break;
            case CardSuit.DIAMONDS: suitSymbol = '♦'; break;
            case CardSuit.CLUBS: suitSymbol = '♣'; break;
            case CardSuit.SPADES: suitSymbol = '♠'; break;
        }
        
        return `${suitSymbol} ${numStr}`;
    }

    canMatchWith(other: Card): boolean {
        return Math.abs(this.number - other.number) === 1;
    }

    flip(): void {
        this.state = this.state === CardState.COVERED 
            ? CardState.UNCOVERED 
            : CardState.COVERED;
    }
    
    isSameCard(other: Card): boolean {
        return this.number === other.number && this.suit === other.suit;
    }

    // 检查数组中是否有可匹配的卡牌
    static hasMatchingCardInArray(cards: Card[], targetCard: Card): boolean {
        if (!cards || !targetCard) return false;
        return cards.some(card => card.canMatchWith(targetCard));
    }

    // 从数组中查找所有可匹配的卡牌
    static findMatchingCardsInArray(cards: Card[], targetCard: Card): Card[] {
        if (!cards || !targetCard) return [];
        return cards.filter(card => card.canMatchWith(targetCard));
    }

    // 创建一副完整的扑克牌（52张）
    static createFullDeck(): Card[] {
        const deck: Card[] = [];
        const suits = [CardSuit.HEARTS, CardSuit.DIAMONDS, CardSuit.CLUBS, CardSuit.SPADES];
        
        for (const suit of suits) {
            for (let number = 1; number <= 13; number++) {
                deck.push(new Card(number, suit, CardState.COVERED));
            }
        }
        
        return deck;
    }

    // 洗牌（随机打乱数组）
    static shuffleDeck(deck: Card[]): Card[] {
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // 从牌堆中抽取指定数量的卡牌
    static drawCards(deck: Card[], count: number): { drawn: Card[], remaining: Card[] } {
        if (count > deck.length) {
            console.warn(`卡牌不足：需要${count}张，但只剩${deck.length}张`);
            count = deck.length;
        }
        
        const drawn = deck.slice(0, count);
        const remaining = deck.slice(count);
        
        return { drawn, remaining };
    }
}

// ========== BottomDeckManager 类 ==========
export class BottomDeckManager {
    // 牌堆数组
    private bottomDeck: Card[] = [];  // 底牌堆
    private currentBottom: Card | null = null;  // 当前显示的底牌
    private discardPile: Card[] = [];  // 弃牌堆

    // 初始化底牌堆
    initializeBottomDeck(cards: Card[], count: number = 5): void {
        // 确保不超出卡片数量
        const actualCount = Math.min(count, cards.length);
        this.bottomDeck = cards.slice(0, actualCount);
        
        // 设置当前底牌
        if (this.bottomDeck.length > 0) {
            this.currentBottom = this.bottomDeck.shift() || null;
            // 关键：确保当前底牌是正面朝上
            if (this.currentBottom) {
                this.currentBottom.state = CardState.UNCOVERED;
                console.log(`当前底牌设置为正面: ${this.currentBottom.getDisplayName()}`);
            }
        } else {
            this.currentBottom = null;
        }
        
        console.log(`初始化底牌堆: 共 ${actualCount} 张牌`);
    }

    // 获取当前底牌
    getCurrentBottom(): Card | null {
        return this.currentBottom;
    }

    // 设置当前底牌
    setCurrentBottom(card: Card): void {
        this.currentBottom = card;
        if (this.currentBottom) {
            this.currentBottom.state = CardState.UNCOVERED;
        }
        console.log(`设置当前底牌: ${card.getDisplayName()}`);
    }

    // 获取底牌堆剩余数量
    getBottomDeckCount(): number {
        return this.bottomDeck.length;
    }

    // 抽取新底牌
    drawNewBottom(): Card | null {
        if (this.currentBottom) {
            // 将当前底牌放入弃牌堆
            this.discardPile.push(this.currentBottom);
            console.log(`弃置底牌: ${this.currentBottom.getDisplayName()}`);
        }
        
        if (this.bottomDeck.length > 0) {
            this.currentBottom = this.bottomDeck.shift() || null;
            // 关键：确保新抽取的底牌是正面朝上
            if (this.currentBottom) {
                this.currentBottom.state = CardState.UNCOVERED;
                console.log(`抽取新底牌: ${this.currentBottom.getDisplayName()}`);
            }
            return this.currentBottom;
        }
        
        console.log('底牌堆已空，无法抽取新底牌');
        return null;
    }

    // 检查是否可以抽取新底牌
    canDrawNewBottom(): boolean {
        return this.bottomDeck.length > 0;
    }

    // 获取已使用的底牌数量
    getUsedBottomCount(): number {
        return this.discardPile.length;
    }

    // 获取所有弃牌
    getDiscardPile(): Card[] {
        return [...this.discardPile];
    }

    // 清空底牌堆
    clear(): void {
        this.bottomDeck = [];
        this.currentBottom = null;
        this.discardPile = [];
        console.log('已清空底牌堆');
    }

    // 检查当前底牌是否可与手牌匹配
    canMatchWithReserve(reserveCards: Card[]): boolean {
        if (!this.currentBottom) return false;
        
        return reserveCards.some(card => card.canMatchWith(this.currentBottom!));
    }

    // 获取可匹配的手牌
    getMatchingReserveCards(reserveCards: Card[]): Card[] {
        if (!this.currentBottom) return [];
        
        return reserveCards.filter(card => card.canMatchWith(this.currentBottom!));
    }
}