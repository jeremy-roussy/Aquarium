
// if you want to learn all my GreenSock tips and tricks, I got loads of training at
// https://www.creativecodingclub.com


function init() {
	let width = window.innerWidth
let height = window.innerHeight
let centerX = width/2
let centerY = height/2
let toggle_btn = document.querySelector("#toggle")
console.log(width)
let master = gsap.timeline()

CustomWiggle.create("large", { //name
  wiggles: 8, //number of wiggles/oscilations 
  type:"easeInOut" 
});

CustomWiggle.create("medium", { //name
  wiggles: 8, //number of wiggles/oscilations 
  type:"easeInOut" 
});

CustomWiggle.create("small", { //name
  wiggles: 20, //number of wiggles/oscilations 
  type:"easeInOut" 
});

let small = {
	ease:"small",
	duration:2,
	min:0.1,
	max:0.3,
	scaleEase:"none"
}

let medium = {
	ease:"medium",
	duration:4,
	min:0.4,
	max:0.6,
	scaleEase:"power2.in"
	
}

let large = {
	ease:"large",
	duration:5,
	min:0.7,
	max:1	,
	scaleEase:"power4.in"
}

let configs = [small, medium, large]


function weightedRandom(collection, ease) {
	return gsap.utils.pipe(
		Math.random,            //random number between 0 and 1
		gsap.parseEase(ease),   //apply the ease
		gsap.utils.mapRange(0, 1, -0.5, collection.length-0.5), //map to the index range of the array, stretched by 0.5 each direction because we'll round and want to keep distribution (otherwise linear distribution would be center-weighted slightly)
		gsap.utils.snap(1),     //snap to the closest integer
		i => collection[i]      //return that element from the array
	);
}

// usage:
let getRandomConfig = weightedRandom(configs, "power4.in");



function createBubbles(amount) {
	for(let i = 0; i < amount; i++){
		let bubble = document.createElement("div")
		
		let bubbleType = getRandomConfig()
		let scale = gsap.utils.random(bubbleType.min, bubbleType.max)
		let ease = bubbleType.ease
		let scaleEase = bubbleType.scaleEase
		let duration = bubbleType.duration
		let tl = gsap.timeline({repeat:-1, repeatDelay:Math.random() * 3})
		let relativeDirection = Math.random() < 0.5 ? "+=" : "-="
		//console.log(bubbleType.ease, scale)
		
		bubble.setAttribute("class", "bubble")
		document.body.appendChild(bubble)
	   tl.set(bubble, {x:gsap.utils.random(0,width), y:height+(100 * scale), xPercent:-50, yPercent:-50, scale:0})
		
		tl.to(bubble, {y:-200, duration:duration, ease:"power1.in"})
		tl.to(bubble, {duration:1, scale:scale, ease:scaleEase}, gsap.utils.random(0, 0.5))
		tl.to(bubble, {x:relativeDirection + scale * 80, ease:ease, duration:duration * 2, }, gsap.utils.random(0.3, 1.5))
		
		master.add(tl, i * 0.1)
		

		
	}
	master.timeScale(600/height)
	master.time(100000)
}

toggle_btn.addEventListener("click", () => {
	master.reversed(!master.reversed())
})


createBubbles(100)
	gsap.to("body", {opacity:1, duration:0.2})
}


gsap.delayedCall(0.1, init)
