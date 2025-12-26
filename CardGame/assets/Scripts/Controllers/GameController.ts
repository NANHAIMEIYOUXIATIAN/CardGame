import { _decorator, Component, Node, Prefab, instantiate, Label, Button, Sprite, Color, UITransform, Event } from 'cc';
import { Card, CardSuit, CardState, BottomDeckManager } from '../models/Card';

const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    // 预制体绑定
    @property(Prefab)
    cardPrefab: Prefab = null!;
    
    // 节点绑定
    @property(Node)
    mainPileNode: Node = null!;  // 主牌堆
    
    @property(Node)
    bottomDeckNode: Node = null!;  // 底牌堆
    
    @property(Node)
    currentBottomNode: Node = null!;  // 当前底牌
    
    @property(Node)
    reservePileNode: Node = null!;  // 手牌区
    
    // UI元素绑定
    @property(Label)
    infoLabel: Label = null!;
    
    @property(Label)
    bottomDeckCountLabel: Label = null!;
    
    @property(Button)
    undoButton: Button = null!;
    
    @property(Button)
    restartButton: Button = null!;

    // 游戏数据
    private mainPileCards: Card[] = [];
    private reservePileCards: Card[] = [];
    private bottomDeckManager: BottomDeckManager = new BottomDeckManager();
    
    private operationHistory: Array<{
        type: string;
        card: Card;
        fromPile: 'reserve' | 'bottomDeck';
        previousBottomCard: Card | null;
    }> = [];

    onLoad() {
        console.log('🎮 GameController加载成功 - 修复底牌堆点击问题');
        this.validateBindings();
        this.initGame();
        this.setupEventListeners();
    }

    validateBindings(): void {
        console.log('=== 验证组件绑定 ===');
        
        const checks = [
            { name: 'cardPrefab', value: this.cardPrefab, required: true },
            { name: 'mainPileNode', value: this.mainPileNode, required: true },
            { name: 'bottomDeckNode', value: this.bottomDeckNode, required: true },
            { name: 'currentBottomNode', value: this.currentBottomNode, required: true },
            { name: 'reservePileNode', value: this.reservePileNode, required: true },
            { name: 'infoLabel', value: this.infoLabel, required: true },
            { name: 'bottomDeckCountLabel', value: this.bottomDeckCountLabel, required: false },
            { name: 'undoButton', value: this.undoButton, required: true },
            { name: 'restartButton', value: this.restartButton, required: true }
        ];
        
        checks.forEach(check => {
            if (!check.value && check.required) {
                console.error(`❌ ${check.name} 未绑定！`);
            } else if (check.value) {
                console.log(`✅ ${check.name} 已绑定`);
            }
        });
    }

    initGame(): void {
        console.log('=== 开始新游戏 ===');
        
        this.clearAllPiles();
        this.createFullDeck();
        this.distributeCards();
        this.layoutAllCards();
        this.updateGameInfo();
        
        console.log('=== 游戏初始化完成 ===');
    }

    clearAllPiles(): void {
        if (this.mainPileNode) this.mainPileNode.removeAllChildren();
        if (this.bottomDeckNode) this.bottomDeckNode.removeAllChildren();
        if (this.currentBottomNode) this.currentBottomNode.removeAllChildren();
        if (this.reservePileNode) this.reservePileNode.removeAllChildren();
        
        this.mainPileCards = [];
        this.reservePileCards = [];
        this.operationHistory = [];
        
        console.log('已清空所有牌堆');
    }

    createFullDeck(): void {
        console.log('创建完整52张扑克牌...');
        
        this.mainPileCards = [];
        const suits = [CardSuit.HEARTS, CardSuit.DIAMONDS, CardSuit.CLUBS, CardSuit.SPADES];
        
        for (const suit of suits) {
            for (let number = 1; number <= 13; number++) {
                this.mainPileCards.push(new Card(number, suit, CardState.COVERED));
            }
        }
        
        this.shuffleDeck(this.mainPileCards);
        
        console.log(`创建了 ${this.mainPileCards.length} 张扑克牌`);
    }

    shuffleDeck(deck: Card[]): void {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    distributeCards(): void {
        console.log('分发卡牌...');
        
        // 1. 底牌堆：5张牌
        const bottomDeckCards = this.mainPileCards.splice(0, 5);
        this.bottomDeckManager.initializeBottomDeck(bottomDeckCards, 5);
        
        // 2. 手牌区：3张牌
        for (let i = 0; i < 3; i++) {
            if (this.mainPileCards.length > 0) {
                const card = this.mainPileCards.shift()!;
                card.state = CardState.UNCOVERED;
                this.reservePileCards.push(card);
            }
        }
        
        console.log(`分发完成：主牌堆${this.mainPileCards.length}张，底牌堆5张，手牌区${this.reservePileCards.length}张`);
        
        this.reservePileCards.forEach((card, index) => {
            console.log(`手牌[${index}]: ${card.getDisplayName()}`);
        });
        
        const currentBottom = this.bottomDeckManager.getCurrentBottom();
        if (currentBottom) {
            console.log(`当前底牌: ${currentBottom.getDisplayName()}`);
        }
    }

    drawOneToReserve(): boolean {
        if (this.mainPileCards.length === 0) {
            console.log('主牌堆已空，无法抽牌');
            return false;
        }
        
        const drawnCard = this.mainPileCards.shift()!;
        drawnCard.state = CardState.UNCOVERED;
        this.reservePileCards.push(drawnCard);
        
        console.log(`抽牌到手牌区: ${drawnCard.getDisplayName()}`);
        return true;
    }

    autoFillReserve(): void {
        console.log('自动补充手牌...');
        
        while (this.reservePileCards.length < 3 && this.mainPileCards.length > 0) {
            this.drawOneToReserve();
        }
    }

    layoutAllCards(): void {
        console.log('开始布局卡牌...');
        
        this.layoutMainPile();
        this.layoutBottomDeck();
        this.layoutCurrentBottom();
        this.layoutReservePile();
        
        console.log('卡牌布局完成');
    }

    layoutMainPile(): void {
        if (!this.mainPileNode) {
            console.error('mainPileNode 未绑定');
            return;
        }
        
        this.mainPileNode.removeAllChildren();
        
        if (this.mainPileCards.length > 0) {
            console.log(`布局主牌堆，剩余 ${this.mainPileCards.length} 张牌`);
            this.createCardBack(this.mainPileNode, 0, 0);
        }
    }

    layoutBottomDeck(): void {
        if (!this.bottomDeckNode) {
            console.error('❌ bottomDeckNode 未绑定');
            return;
        }
        
        this.bottomDeckNode.removeAllChildren();
        
        const bottomDeckCount = this.bottomDeckManager.getBottomDeckCount();
        console.log(`底牌堆剩余数量: ${bottomDeckCount}张`);
        
        if (bottomDeckCount > 0) {
            this.createCardBack(this.bottomDeckNode, 0, 0);
            
            // 重新绑定点击事件
            this.setupBottomDeckClickable();
            
            if (this.bottomDeckCountLabel) {
                this.bottomDeckCountLabel.string = `${bottomDeckCount}`;
                this.bottomDeckCountLabel.node.active = true;
            }
            
            console.log(`✅ 底牌堆布局完成，剩余${bottomDeckCount}张`);
        } else {
            if (this.bottomDeckCountLabel) {
                this.bottomDeckCountLabel.node.active = false;
            }
            console.log('底牌堆已空');
        }
    }

    layoutCurrentBottom(): void {
        if (!this.currentBottomNode) {
            console.error('❌ currentBottomNode 未绑定');
            return;
        }
        
        this.currentBottomNode.removeAllChildren();
        
        const currentBottom = this.bottomDeckManager.getCurrentBottom();
        if (currentBottom) {
            console.log(`布局当前底牌: ${currentBottom.getDisplayName()}`);
            
            this.createAndPlaceCard(
                currentBottom,
                this.currentBottomNode,
                0,
                0,
                'current-bottom'
            );
        }
    }

    layoutReservePile(): void {
        if (!this.reservePileNode) {
            console.error('reservePileNode 未绑定');
            return;
        }
        
        this.reservePileNode.removeAllChildren();
        
        if (this.reservePileCards.length === 0) {
            console.log('手牌区为空');
            return;
        }
        
        console.log(`布局手牌区，共 ${this.reservePileCards.length} 张卡牌`);
        
        const cardWidth = 80;
        const spacing = 20;
        const totalWidth = (this.reservePileCards.length * cardWidth) + ((this.reservePileCards.length - 1) * spacing);
        const startX = -totalWidth / 2 + cardWidth / 2;
        
        this.reservePileCards.forEach((card, index) => {
            const x = startX + index * (cardWidth + spacing);
            this.createAndPlaceCard(card, this.reservePileNode, x, 0, 'reserve');
        });
    }

    createCardBack(parentNode: Node, x: number, y: number): void {
        if (!this.cardPrefab) return;
        
        const cardNode = instantiate(this.cardPrefab);
        cardNode.setPosition(x, y, 0);
        
        const cardView = cardNode.getComponent('CardView');
        if (cardView) {
            (cardView as any).init(new Card(1, CardSuit.HEARTS, CardState.COVERED));
        }
        
        parentNode.addChild(cardNode);
    }

    createAndPlaceCard(card: Card, parentNode: Node, x: number, y: number, pileType: string): void {
        if (!this.cardPrefab || !parentNode) {
            console.error('无法创建卡牌：预制体或父节点未绑定');
            return;
        }
        
        try {
            const cardNode = instantiate(this.cardPrefab);
            cardNode.setPosition(x, y, 0);
            
            const cardView = cardNode.getComponent('CardView');
            if (cardView) {
                (cardView as any).init(card);
                
                if (pileType === 'reserve') {
                    cardNode.on('card-click', (clickedCard: Card) => {
                        console.log(`收到手牌点击事件: ${clickedCard.getDisplayName()}`);
                        this.onReserveCardClicked(clickedCard);
                    });
                }
            }
            
            parentNode.addChild(cardNode);
            
        } catch (error) {
            console.error('创建卡牌时出错:', error);
        }
    }

    // 设置底牌堆可点击
    setupBottomDeckClickable(): void {
        if (!this.bottomDeckNode) return;
        
        console.log('设置底牌堆可点击...');
        
        // 确保有Button组件
        let button = this.bottomDeckNode.getComponent(Button);
        if (!button) {
            console.log('为底牌堆添加Button组件');
            button = this.bottomDeckNode.addComponent(Button);
            button.transition = Button.Transition.COLOR;
            button.normalColor = new Color(255, 255, 255, 30);
            button.pressedColor = new Color(200, 200, 200, 60);
            button.hoverColor = new Color(230, 230, 230, 60);
        }
        
        // 确保有UITransform组件
        let uiTransform = this.bottomDeckNode.getComponent(UITransform);
        if (!uiTransform) {
            uiTransform = this.bottomDeckNode.addComponent(UITransform);
            uiTransform.width = 120;
            uiTransform.height = 180;
        }
        
        // 激活节点
        this.bottomDeckNode.active = true;
        
        console.log('✅ 底牌堆可点击设置完成');
    }

    // 设置事件监听器
    setupEventListeners(): void {
        console.log('=== 设置事件监听器 ===');
        
        // 回退按钮
        if (this.undoButton) {
            console.log('绑定回退按钮事件...');
            this.undoButton.node.off(Button.EventType.CLICK);
            this.undoButton.node.on(Button.EventType.CLICK, () => {
                console.log('🎯 回退按钮被点击！');
                this.onUndoButtonClick();
            });
            console.log('✅ 回退按钮事件绑定成功');
        }
        
        // 重新开始按钮
        if (this.restartButton) {
            console.log('绑定重新开始按钮事件...');
            this.restartButton.node.off(Button.EventType.CLICK);
            this.restartButton.node.on(Button.EventType.CLICK, () => {
                console.log('🎯 重新开始按钮被点击！');
                this.onRestartButtonClick();
            });
            console.log('✅ 重新开始按钮事件绑定成功');
        }
        
        // 延迟设置底牌堆点击监听
        this.scheduleOnce(() => {
            this.setupBottomDeckClickListener();
        }, 0.1);
        
        console.log('=== 事件监听器设置完成 ===');
    }

    // 设置底牌堆点击监听
    setupBottomDeckClickListener(): void {
        console.log('设置底牌堆点击监听...');
        
        if (!this.bottomDeckNode) {
            console.error('❌ bottomDeckNode 未绑定');
            return;
        }
        
        console.log('底牌堆节点信息:', {
            name: this.bottomDeckNode.name,
            active: this.bottomDeckNode.active,
            childrenCount: this.bottomDeckNode.children.length
        });
        
        // 确保节点激活
        this.bottomDeckNode.active = true;
        
        // 添加Button组件
        let button = this.bottomDeckNode.getComponent(Button);
        if (!button) {
            button = this.bottomDeckNode.addComponent(Button);
            button.transition = Button.Transition.COLOR;
            button.normalColor = new Color(255, 255, 255, 30);
            button.pressedColor = new Color(200, 200, 200, 60);
            button.hoverColor = new Color(230, 230, 230, 60);
        }
        
        // 添加UITransform组件
        let uiTransform = this.bottomDeckNode.getComponent(UITransform);
        if (!uiTransform) {
            uiTransform = this.bottomDeckNode.addComponent(UITransform);
            uiTransform.width = 120;
            uiTransform.height = 180;
        }
        
        // 移除旧监听器
        this.bottomDeckNode.off(Button.EventType.CLICK);
        
        // 绑定点击事件
        this.bottomDeckNode.on(Button.EventType.CLICK, () => {
            console.log('🎯🎯🎯 底牌堆被点击！');
            this.onBottomDeckClicked();
        });
        
        console.log('✅ 底牌堆点击事件绑定成功');
    }

    onReserveCardClicked(clickedCard: Card): void {
        console.log('=== 处理手牌点击 ===');
        console.log(`点击的手牌: ${clickedCard.getDisplayName()}`);
        
        const currentBottom = this.bottomDeckManager.getCurrentBottom();
        console.log(`当前底牌: ${currentBottom ? currentBottom.getDisplayName() : '无'}`);
        
        const isInReserve = this.reservePileCards.some(card => 
            card.isSameCard(clickedCard)
        );
        
        if (!isInReserve) {
            this.showMessage('这张卡牌不在手牌区');
            return;
        }
        
        if (!currentBottom) {
            this.showMessage('当前没有底牌');
            return;
        }
        
        if (clickedCard.canMatchWith(currentBottom)) {
            this.matchReserveWithBottom(clickedCard);
            this.showMessage(`匹配成功！${clickedCard.getDisplayName()} 成为新底牌`);
        } else {
            this.showMessage(`不能匹配！需要与 ${currentBottom.number} 相差1`);
        }
    }

    onBottomDeckClicked(): void {
        console.log('=== 底牌堆点击处理开始 ===');
        console.log('当前底牌堆剩余数量:', this.bottomDeckManager.getBottomDeckCount());
        
        if (!this.bottomDeckManager.canDrawNewBottom()) {
            console.log('底牌堆已空，无法抽取');
            this.showMessage('底牌堆已空，无法抽取新底牌');
            return;
        }
        
        const previousBottom = this.bottomDeckManager.getCurrentBottom();
        this.operationHistory.push({
            type: 'draw-new-bottom',
            card: previousBottom!,
            fromPile: 'bottomDeck',
            previousBottomCard: previousBottom
        });
        
        const newBottom = this.bottomDeckManager.drawNewBottom();
        
        if (newBottom) {
            console.log(`抽取到新底牌: ${newBottom.getDisplayName()}`);
            
            this.layoutCurrentBottom();
            this.layoutBottomDeck();
            this.updateGameInfo();
            
            this.showMessage(`抽取新底牌: ${newBottom.getDisplayName()}`);
        }
        
        console.log('=== 底牌堆点击处理结束 ===');
    }

    matchReserveWithBottom(reserveCard: Card): void {
        console.log(`匹配手牌 ${reserveCard.getDisplayName()} 与底牌`);
        
        const previousBottom = this.bottomDeckManager.getCurrentBottom();
        
        this.operationHistory.push({
            type: 'match-success',
            card: reserveCard,
            fromPile: 'reserve',
            previousBottomCard: previousBottom
        });
        
        this.reservePileCards = this.reservePileCards.filter(c => !c.isSameCard(reserveCard));
        
        this.autoFillReserve();
        
        this.bottomDeckManager.setCurrentBottom(reserveCard);
        
        this.layoutAllCards();
        this.updateGameInfo();
        
        console.log(`匹配完成，手牌 ${reserveCard.getDisplayName()} 成为新底牌`);
    }

    onUndoButtonClick(): void {
        console.log('=== 执行回退操作 ===');
        
        if (this.operationHistory.length === 0) {
            this.showMessage('没有可回退的操作');
            return;
        }
        
        const lastOperation = this.operationHistory.pop();
        if (!lastOperation) return;
        
        console.log(`回退操作: ${lastOperation.type}, 卡牌: ${lastOperation.card.getDisplayName()}`);
        
        this.showMessage(`已回退: ${lastOperation.card.getDisplayName()}`);
        
        this.layoutAllCards();
        this.updateGameInfo();
    }

    onRestartButtonClick(): void {
        console.log('=== 重新开始游戏 ===');
        
        if (this.infoLabel) {
            this.infoLabel.string = '正在洗牌...';
            
            this.scheduleOnce(() => {
                this.initGame();
                this.showMessage('游戏已重新开始！');
            }, 0.5);
        } else {
            this.initGame();
            this.showMessage('游戏已重新开始！');
        }
    }

    updateGameInfo(): void {
        if (!this.infoLabel) {
            console.error('信息标签未绑定');
            return;
        }
        
        const mainCount = this.mainPileCards.length;
        const reserveCount = this.reservePileCards.length;
        const bottomDeckCount = this.bottomDeckManager.getBottomDeckCount();
        const currentBottom = this.bottomDeckManager.getCurrentBottom();
        const bottomName = currentBottom ? currentBottom.getDisplayName() : '无';
        const historyCount = this.operationHistory.length;
        
        let hasMatchingCards = false;
        let matchableCount = 0;
        
        if (currentBottom) {
            const matchingCards = this.reservePileCards.filter(card => 
                card.canMatchWith(currentBottom)
            );
            matchableCount = matchingCards.length;
            hasMatchingCards = matchableCount > 0;
        }
        
        let gameStatus = '';
        if (hasMatchingCards) {
            gameStatus = `有 ${matchableCount} 张手牌可匹配`;
        } else {
            if (bottomDeckCount > 0) {
                gameStatus = '无手牌可匹配，点击底牌堆抽取新底牌';
            } else {
                gameStatus = '无手牌可匹配，底牌堆已空';
            }
        }
        
        const infoText = 
            `主牌堆: ${mainCount}张卡牌\n` +
            `手牌区: ${reserveCount}张卡牌\n` +
            `当前底牌: ${bottomName}\n` +
            `底牌堆剩余: ${bottomDeckCount}张\n` +
            `${gameStatus}\n` +
            `可回退操作: ${historyCount}次\n` +
            `规则: 点击与底牌数字相差1的手牌进行匹配\n` +
            ` `;
        
        this.infoLabel.string = infoText;
        
        console.log(`更新游戏信息: 主牌堆${mainCount}张, 手牌区${reserveCount}张, 底牌${bottomName}, 底牌堆剩余${bottomDeckCount}张`);
    }

    showMessage(message: string): void {
        if (!this.infoLabel) return;
        
        const originalText = this.infoLabel.string;
        this.infoLabel.string = message;
        
        this.scheduleOnce(() => {
            if (this.infoLabel) {
                this.infoLabel.string = originalText;
            }
        }, 3);
    }
}