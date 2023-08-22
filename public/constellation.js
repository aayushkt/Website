var canvas = document.getElementById('constellation'),
	context = canvas.getContext('2d'),
    particleColor = '#eb5e28',
    temp = 0.0,
    particleCount = 70,
    particleBaseSize = 1,
    particleSizeMultiplier = 0.5,
    particles = [],
    links = [],
    linkColor = '#f98948',
    linkSpeed = 0.01,
    linkFadeSpeed = 0.01,
    maxLinks = 15;
    linkLineWidth = 2,
    mouse = { x: 0, y: 0 },
    lastMouse = {x: 0, y: 0},
    mouseMoved = false;

function init() {
    if ('ontouchstart' in document.documentElement && window.DeviceOrientationEvent) {
		window.addEventListener('deviceorientation', function(e) {
			mouse.x = (canvas.clientWidth / 2) - ((e.gamma / 90) * (canvas.clientWidth / 2) * 2);
			mouse.y = (canvas.clientHeight / 2) - ((e.beta / 90) * (canvas.clientHeight / 2) * 2);
		}, true);
	}
	else {
		document.body.addEventListener('mousemove', function(e) {
            lastMouse.x = mouse.x;
            lastMouse.y = mouse.y;
			mouse.x = e.clientX;
			mouse.y = e.clientY;
            mouseMoved = true;
		});
	}

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;


    // requestAnimFrame polyfill
    window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                function( callback ){
                    window.setTimeout(callback, 1000 / 60);
                };
    })();

    // Create particle positions
    for (var i = 0; i < particleCount; i++) {
        particles.push(new Particle);
    }

    links.push(new Link(randParticle(), randParticle()));

    // Animation loop
    (function animloop(){
        requestAnimFrame(animloop);
        render();
    })();
}
    
var Particle = function() {
    this.x = random(-0.1, 1.1, true);
    this.y = random(-0.1, 1.1, true);
    this.z = random(0,4);
    this.opacity = random(0.1, 1, true);
};

Particle.prototype.render = function() {
	var	r = ((this.z * particleSizeMultiplier) + particleBaseSize) * (sizeRatio() / 1000),
		o = this.opacity;

    if (!mouseMoved){
        lastMouse.x += (mouse.x - lastMouse.x) * 0.001;
        lastMouse.y += (mouse.y - lastMouse.y) * 0.001;
    }

    this.x += (lastMouse.x - mouse.x) * this.z / (canvas.width * 10);
    this.y += (lastMouse.y - mouse.y) * this.z / (canvas.width * 10);


	context.fillStyle = particleColor;
	context.globalAlpha = o;
	context.beginPath();
	context.arc(this.x * canvas.width, this.y * canvas.height, r, 0, 2 * Math.PI);
	context.fill();
	context.closePath();

};

function render() {
	// Clear
	context.clearRect(0, 0, canvas.width, canvas.height);

    if (links.length == 0) {
        spawnLinkFrom(randParticle());
    }

    for (var i = links.length - 1; i > -1; --i){
        if (links[i].alpha <= 0){
            links = links.slice(0, i).concat(links.slice(i + 1))
        } else {
            links[i].render();
        }
    }

    for (var i = 0; i < particles.length; ++i) {
        particles[i].render();
    }

    mouseMoved = false;
}

function random(min, max, float) {
	return float ?
		Math.random() * (max - min) + min :
		Math.floor(Math.random() * (max - min + 1)) + min;
}

function sizeRatio() {
	return canvas.width >= canvas.height ? canvas.width : canvas.height;
}

var Link = function(startVertex, endVertex) {
	this.finished = 0.0;
    this.startVertex = startVertex;
    this.endVertex = endVertex;
    this.alpha = Math.min(startVertex.opacity, endVertex.opacity);
    this.fadeSpeed = random(1.0, 1.2, true);
    this.distance = Math.sqrt((this.endVertex.x - this.startVertex.x)**2 + (this.endVertex.y - this.startVertex.y)**2)
};

Link.prototype.render = function() {
    temp = linkSpeed / this.distance;
    if (this.finished < 1.0 - temp) {
        this.finished += temp;
    } else if (this.finished < 1.0 ){
        this.finished = 1.0;
        spawnLinkFrom(this.endVertex);
    } else {
        this.alpha -= linkFadeSpeed * this.fadeSpeed;
        if (this.alpha < 0.0){this.alpha = 0.0;}
    }

    context.globalAlpha = this.alpha;
    endpointx = (this.endVertex.x - this.startVertex.x) * this.finished + this.startVertex.x;
    endpointy = (this.endVertex.y - this.startVertex.y) * this.finished + this.startVertex.y;
    context.beginPath();
    context.moveTo(this.startVertex.x * canvas.width, this.startVertex.y * canvas.height);
    context.lineTo(endpointx * canvas.width, endpointy * canvas.height);
    context.closePath();
    context.strokeStyle = linkColor;
    context.lineWidth = linkLineWidth;
    context.stroke();
};

function randParticle() {
    return particles[Math.floor(Math.random()*particles.length)];
}

function spawnLinkFrom(startingParticle) {
    if (links.length >= maxLinks) {return;}
    temp = Math.random();
    
    links.push(new Link(startingParticle, randParticle()));
    if (temp > 0.5) {
        links.push(new Link(startingParticle, randParticle()));
    }
    if (temp > 0.75) {
        links.push(new Link(startingParticle, randParticle()));
    }
    
}

init();