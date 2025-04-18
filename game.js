class Snake {
    constructor() {
        this.reset();
    }

    reset() {
        this.position = [{ x: 10, y: 10 }];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.grew = false;
    }

    move() {
        this.direction = this.nextDirection;
        const head = { x: this.position[0].x + this.direction.x, y: this.position[0].y + this.direction.y };
        this.position.unshift(head);
        if (!this.grew) {
            this.position.pop();
        }
        this.grew = false;
    }

    grow() {
        this.grew = true;
    }

    checkCollision(width, height) {
        const head = this.position[0];
        if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height) {
            return true;
        }
        return this.position.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.width = this.canvas.width / this.gridSize;
        this.height = this.canvas.height / this.gridSize;
        this.snake = new Snake();
        this.food = this.generateFood();
        this.score = 0;
        this.gameOver = false;
        this.speed = 200; // Initial speed (slower)
        this.minSpeed = 50; // Maximum speed (faster)
        this.speedDecrease = 5; // How much to decrease the interval
        this.setupControls();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            const key = e.key;
            const direction = this.snake.direction;
            const newDirection = { x: direction.x, y: direction.y };

            switch (key) {
                case 'ArrowUp':
                    if (direction.y === 0) newDirection.x = 0, newDirection.y = -1;
                    break;
                case 'ArrowDown':
                    if (direction.y === 0) newDirection.x = 0, newDirection.y = 1;
                    break;
                case 'ArrowLeft':
                    if (direction.x === 0) newDirection.x = -1, newDirection.y = 0;
                    break;
                case 'ArrowRight':
                    if (direction.x === 0) newDirection.x = 1, newDirection.y = 0;
                    break;
            }

            this.snake.nextDirection = newDirection;
        });
    }

    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.width),
                y: Math.floor(Math.random() * this.height)
            };
        } while (this.snake.position.some(segment => segment.x === food.x && segment.y === food.y));
        return food;
    }

    update() {
        if (this.gameOver) return;

        this.snake.move();

        if (this.snake.checkCollision(this.width, this.height)) {
            this.endGame();
            return;
        }

        const head = this.snake.position[0];
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            document.getElementById('score').textContent = `Score: ${this.score}`;
            this.snake.grow();
            this.food = this.generateFood();
            // Increase speed gradually
            if (this.speed > this.minSpeed) {
                this.speed = Math.max(this.minSpeed, this.speed - this.speedDecrease);
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.snake.position.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#2ecc71' : '#27ae60';
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
            );
        });

        // Draw food
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 1,
            this.gridSize - 1
        );
    }

    endGame() {
        this.gameOver = true;
        document.getElementById('game-over').style.display = 'block';
        document.getElementById('final-score').textContent = this.score;
    }

    reset() {
        this.snake.reset();
        this.food = this.generateFood();
        this.score = 0;
        this.gameOver = false;
        this.speed = 200; // Reset speed to initial value
        document.getElementById('score').textContent = 'Score: 0';
        document.getElementById('game-over').style.display = 'none';
    }
}

let game;

function gameLoop() {
    game.update();
    game.draw();
    setTimeout(() => requestAnimationFrame(gameLoop), game.speed);
}

function startGame() {
    if (!game) {
        game = new Game();
    } else {
        game.reset();
    }
    gameLoop();
}

startGame();