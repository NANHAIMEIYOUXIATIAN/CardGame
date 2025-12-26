import { _decorator, Component, Node, Label, Color, Sprite, Button } from 'cc';
import { Card, CardSuit, CardState } from '../models/Card';
const { ccclass, property } = _decorator;

@ccclass('CardView')
export class CardView extends Component {
    @property(Node)
    frontNode: Node = null!;
    
    @property(Node)
    backNode: Node = null!;
    
    @property(Label)
    numberLabel: Label = null!;
    
    @property(Label)
    suitLabel: Label = null!;
    
    @property(Sprite)
    frontSprite: Sprite = null!;
    
    @property(Sprite)
    backSprite: Sprite = null!;

    private _card: Card | null = null;

    onLoad() {
        let button = this.node.getComponent(Button);
        if (!button) {
            button = this.node.addComponent(Button);
            button.transition = Button.Transition.COLOR;
            button.normalColor = Color.WHITE;
            button.pressedColor = new Color(200, 200, 200, 255);
            button.hoverColor = new Color(230, 230, 230, 255);
        }
        
        button.node.on(Button.EventType.CLICK, this.onCardClick, this);
    }

    init(card: Card): void {
        this._card = card;
        this.updateView();
    }

    getCard(): Card | null {
        return this._card;
    }

    updateView(): void {
        if (!this._card) return;
        
        if (this._card.state === CardState.COVERED) {
            this.showBack();
        } else {
            this.showFront();
        }
    }

    private showFront(): void {
        if (!this.frontNode || !this.backNode || !this._card) return;
        
        this.frontNode.active = true;
        this.backNode.active = false;
        
        if (this.numberLabel) {
            let numStr: string;
            switch (this._card.number) {
                case 1: numStr = 'A'; break;
                case 11: numStr = 'J'; break;
                case 12: numStr = 'Q'; break;
                case 13: numStr = 'K'; break;
                default: numStr = this._card.number.toString();
            }
            this.numberLabel.string = numStr;
        }
        
        if (this.suitLabel) {
            let suitSymbol = '';
            let labelColor = Color.BLACK;
            
            switch (this._card.suit) {
                case CardSuit.HEARTS:
                    suitSymbol = '♥';
                    labelColor = Color.RED;
                    break;
                case CardSuit.DIAMONDS:
                    suitSymbol = '♦';
                    labelColor = Color.RED;
                    break;
                case CardSuit.CLUBS:
                    suitSymbol = '♣';
                    labelColor = Color.BLACK;
                    break;
                case CardSuit.SPADES:
                    suitSymbol = '♠';
                    labelColor = Color.BLACK;
                    break;
            }
            
            this.suitLabel.string = suitSymbol;
            this.suitLabel.color = labelColor;
            
            if (this.numberLabel) {
                this.numberLabel.color = labelColor;
            }
        }
    }

    private showBack(): void {
        if (!this.frontNode || !this.backNode) return;
        
        this.frontNode.active = false;
        this.backNode.active = true;
        
        if (this.backSprite) {
            this.backSprite.color = new Color(70, 130, 180);
        }
    }

    private onCardClick(): void {
        if (!this._card) return;
        
        console.log('CardView: 卡牌被点击', this._card.getDisplayName());
        
        this.node.emit('card-click', this._card);
    }
}