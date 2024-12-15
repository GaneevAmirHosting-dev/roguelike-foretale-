const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerMoveImages = [];
const playerStandImages = [];
const playerJumpImages = [];
let platformImages = {};
let objects = [];
let platforms = []; 



let animationFrameCount = 0;
const animationSpeed = 5;
let currentImageIndex = 0;
let gravity = 1;



let timer;



const canvasWidth = 8000;
const canvasHeight = 400;



let viewport = {
    x: 0,
    y: 0,
    width: 1400,
    height: canvasHeight
};

let keys = {
    isMovingLeft : false,
    isMovingRight : false,
    isJump : false,
    isStanding : true
};

let player = {
    x : 200,
    y : 300,
    dy : 0,
    width : 32,
    height : 48,
    jumpPower : -15,
    onGround : false,
    speed : 3
};










const animationImg = (path, countImg, folderName) => {
    let loadedImagesCount = 0; // Counter for loaded images
    for (let i = 1; i <= countImg; i++){
        const img = new Image();
        img.src = `${path}image_${i}.png`;
        img.onload = () => {
            loadedImagesCount++;
        };
        folderName.push(img);
    }
}
animationImg('img/texture/life/player/move/', 4, playerMoveImages)
animationImg('img/texture/life/player/stand/', 4, playerStandImages)
animationImg('img/texture/life/player/jump/', 4, playerJumpImages)



const updateStanding = () => {
    animationFrameCount++;
    if (animationFrameCount >= animationSpeed) {
        currentImageIndex = (currentImageIndex + 1) % playerStandImages.length;
        animationFrameCount = 0; // Сброс счетчика
    }
    ctx.drawImage(playerStandImages[currentImageIndex], player.x, player.y, player.width, player.height);
};

const сontrolsInput = () => {
    document.addEventListener('keydown', (event) => {
    if (event.key === 'a') {
        keys.isMovingLeft = true;
    }
    if (event.key === 'd') {
        keys.isMovingRight = true;
    }
    if (event.code === 'Space') {
        keys.isJump = true; 
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'a') {
        keys.isMovingLeft = false;
    }
    if (event.key === 'd') {
        keys.isMovingRight = false;
    }
});
}




const drawRepeatedTexture = (texture, x, y, width, height) => {
    const repeatX = Math.ceil(width / texture.width);
    const repeatY = Math.ceil(height / texture.height);

    for (let i = 0; i < repeatX; i++) {
        for (let j = 0; j < repeatY; j++) {
            ctx.drawImage(texture, x + i * texture.width, y + j * texture.height);
        }
    }
};



const loadSprites = async (url) => {
    const response = await fetch(url);
    platforms = await response.json();


    for (let platform of platforms) {
        if (platform.sprite) {
            const img = new Image();
            img.src = platform.sprite;
            platformImages[platform.type] = img; 
        }
    }
};


loadSprites('json/levels/level_1.json').then(() => {
    gameLoop();
});



const update = () => {
    



    сontrolsInput();

    player.dy += gravity;
    player.y += player.dy;

    player.onGround = false;
    for (let platform of platforms) {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height < platform.y + platform.height &&
            player.y + player.height + player.dy >= platform.y) {
            player.y = platform.y - player.height;
            player.dy = 0;
            player.onGround = true;
        }
    }

    if (keys.isMovingLeft) {
        player.x -= player.speed;
    }
    if (keys.isMovingRight) {
        player.x += player.speed;
    }
    if (keys.isJump && player.onGround) {
        player.dy = player.jumpPower;
        player.onGround = false;
        keys.isJump = false;
    }




    // // Если игрок не на земле, он падает
    // if (!player.onGround) {
    //     player.dy += player.gravity;
    // }

    // // Ограничение по границам канваса
    // if (player.y + player.height > canvasHeight) {
    //     player.y = canvasHeight - player.height;
    //     player.dy = 0;
    // }

    // if (player.x < 0) {
    //     player.x = 0; // Не позволяет выходить за левую границу
    // }
    // if (player.x + player.width > canvasWidth) {
    //     player.x = canvasWidth - player.width; // Не позволяет выходить за правую границу
    // }

    // // Сдвиг видимой области
    // if (player.x > viewport.x + 600 ) {
    //     viewport.x += player.speed; // Сдвигаем видимую область вправо
    // }

    // if (player.x < viewport.x + 500 ) {
    //     viewport.x -= player.speed; // Сдвигаем видимую область влево
    // }
}
const draw = () => {
    ctx.clearRect(0, 0, viewport.width, viewport.height);




    for (let platform of platforms) {
        if (platform.x + platform.width > viewport.x && platform.x < viewport.x + viewport.width) {
            drawRepeatedTexture(platformImages[platform.type], platform.x - viewport.x, platform.y, platform.width, platform.height);
        }
    }

    if (player.dy < 0) { // Если игрок в прыжке
        animationFrameCount++;
        if (animationFrameCount >= animationSpeed) {
            currentImageIndex = (currentImageIndex + 1) % playerJumpImages.length;
            animationFrameCount = 0; // Сброс счетчика
        } 
        if (keys.isMovingLeft) {
            ctx.save();
            ctx.scale(-1, 1); // Отразить по горизонтали
            ctx.drawImage(playerJumpImages[currentImageIndex], -player.x - player.width, player.y, player.width, player.height);
            ctx.restore();
        } else {
        ctx.drawImage(playerJumpImages[currentImageIndex], player.x, player.y, player.width, player.height);
        }
    } else if (keys.isMovingLeft) {
        animationFrameCount++;
        if (animationFrameCount >= animationSpeed) {
            currentImageIndex = (currentImageIndex + 1) % playerMoveImages.length;
            animationFrameCount = 0; // Сброс счетчика
        }

        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(playerMoveImages[currentImageIndex], -player.x - player.width, player.y, player.width, player.height);
        ctx.restore();
    } else if (keys.isMovingRight) {
        animationFrameCount++;
        if (animationFrameCount >= animationSpeed) {
            currentImageIndex = (currentImageIndex + 1) % playerMoveImages.length;
            animationFrameCount = 0; // Сброс счетчика
        }

        
        ctx.drawImage(playerMoveImages[currentImageIndex], player.x, player.y, player.width, player.height);
    } else {
        updateStanding();
    }
}






const gameLoop = () => {
    update();
    draw();
    requestAnimationFrame(gameLoop);
};

