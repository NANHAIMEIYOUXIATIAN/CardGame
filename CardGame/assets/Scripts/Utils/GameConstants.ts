export const GameConfig = {
    // 卡牌尺寸
    CARD_WIDTH: 80,
    CARD_HEIGHT: 120,
    
    // 卡牌间距
    CARD_SPACING_X: 20,
    CARD_SPACING_Y: 10,
    
    // 区域位置
    MAIN_PILE_POSITION: { x: 0, y: 200 },
    BOTTOM_PILE_POSITION: { x: 0, y: -100 },
    RESERVE_PILE_POSITION: { x: 200, y: 200 },
    
    // 区域尺寸
    PILE_AREA_WIDTH: 400,
    PILE_AREA_HEIGHT: 150,
    
    // 动画时长
    MOVE_DURATION: 0.5,
    FLIP_DURATION: 0.3,
    
    // 游戏规则
    INITIAL_MAIN_CARDS: 4,
    INITIAL_RESERVE_CARDS: 2,
    
    // 颜色定义
    COLORS: {
        CARD_BACK: '#4682B4',     // 钢蓝色
        CARD_FRONT: '#FFFFFF',    // 白色
        BACKGROUND: '#F0F0F0',    // 浅灰色
        TEXT: '#333333',          // 深灰色
        SUIT_RED: '#FF0000',      // 红色
        SUIT_BLACK: '#000000'     // 黑色
    }
};

