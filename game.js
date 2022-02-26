
//const dom = Htmldom
const TAU = PI * 2

title = "Characters survivors";

description = `
touch = choose a 
position where 
your character go
`;

characters = [
`
yyyy
ylly
ylly
yyyy
ylly
`
];
let janela = {
  x : 200,
  y : 400
}
options = {
  isShowingScore: false,
  viewSize: janela,
  isReplayEnabled: true
};

/** @type {{pos:Vector,target:Vector,life:number, exp: Number, level: Number}}*/
let jogador 

/** @type {{pos:Vector,dir:Vector, radius:Number , ttl: Number}[]} */
let bolasFogo = []

/** @type {{p1:Vector,p2:Vector, ttl: Number}[]} */
let ataquesMelee = []

/** @type {{pos: Vector, angle: Number, ttl: Number, speed: Number}[]} */
let raios = []

/** @type {{pos: Vector, angle: Number, distance: Number, ttl: Number}[]} */
let cobras = []

/** @type {{pos:Vector,dir:Vector,life:number,speed:Number}[]}*/
let inimigos = []

/**@type {{pos:Vector,got:boolean}[]} */
let orbs = []

/** @type {{pos:Vector,ttl:Number,txt:String,up:boolean}[]} */
let particulasTexto = []

let tam = 2

let habilidades = {
	laser : 	0,
	bolaFogo : 	0,
	flecha : 	0,
	cobra:		0
}

let naLojinha = false

function UparHabilidadeAleatoria()
{
	let poder = rndi(0,4)

	switch (poder) {
		case 0:
			habilidades.laser++
			TextParticle("Laser +",vec(jogador.pos),60)
			break;
			
		case 1:
			habilidades.bolaFogo++
			TextParticle("Fireball +",vec(jogador.pos),60)
			
			break;
		case 2:
			habilidades.flecha++
			TextParticle("Arrow +",vec(jogador.pos),60)
			break;
		case 3:
			habilidades.cobra++
			TextParticle("Snake +",vec(jogador.pos),60)
			break;
	
		default:
			break;
	}
}

function Gameloop()
{
	if(jogador.exp >= (jogador.level * 10))
	{
		color('yellow')
		particle(vec(jogador.pos),20,5,0,PI*2)
		play('powerUp')

		naLojinha = true

		jogador.level++
		jogador.life += 50
		jogador.exp = 0
		TextParticle("Level up +",vec(jogador.pos),60,true)
	}
	
	
	if(ticks % 60 === 0) 
	{
		SpawnarInimigo()
		
		AtaqueMelee(VectorsToAngle(vec(jogador.pos),vec(jogador.target)))
		BolaDeFogo(Deg2Rad(rndi(0,360)))
		Raio(Deg2Rad(rndi(0,360)))
		AtirarCobra()
		// Raio(VectorsToAngle(vec(jogador.pos),vec(jogador.target)))
		play('laser')
		//particle(jogador.pos,10,2,angle,Deg2Rad(10))
		
		seconds++
	}

	if(bolasFogo.length > 0)
	{
		color('green')
		remove(bolasFogo,(b)=>{
			b.ttl--
			b.pos.add(b.dir)
			arc(b.pos,b.radius,1,0,PI * 2)
			return b.ttl <= 0
		})
	}
	if(ataquesMelee.length > 0)
	{
		color('green')

		remove(ataquesMelee,(a)=>{
			a.ttl--
			line(a.p1, a.p2, 2)
			return a.ttl <= 0
		})
	}
	if(raios.length > 0)
	{
		color('green')

		raios.forEach((r) =>{
			//r.ttl--
			bar(r.pos.add(AngleToNormalizedVector(r.angle).mul(r.speed)),4,4,r.angle,0)
			
		})
		
	}
	if(cobras.length > 0)
	{
		color('green')

		remove(cobras,(c) =>{

			c.angle += Deg2Rad(5)
			c.distance+= 0.01
			c.ttl--

			arc(c.pos,c.distance,3,c.angle,Number(c.angle) + Deg2Rad(PI))
			//rect(c.pos,5,5)
			return c.ttl <= 0
		})
	}
	if(particulasTexto.length > 0)
	{
		color('blue')

		remove(particulasTexto,(t)=>{
			t.ttl--
			t.pos = vec(t.pos).add(0,t.up ? -1 : 1 )
			text(t.txt,t.pos)
			return t.ttl <= 0
		})
	}

	if(input.isPressed)
	{
		jogador.target = vec(input.pos)

	}
	
	if(jogador.life > 0)
	{
		let dir = AngleToNormalizedVector(VectorsToAngle(jogador.pos,jogador.target))
		jogador.pos.add(dir)
		color('black')
		
		let b = char("a", jogador.pos,{scale:{x:tam,y:tam}});
	}
	
	color('red')

	remove(inimigos, (i) =>{
		i.dir = AngleToNormalizedVector(VectorsToAngle(i.pos,jogador.pos))
		i.pos.add(i.dir.mul(i.speed)) 

		let e = char("e",i.pos)
		if(e.isColliding.rect.green)
		{
			i.life -= 50
			particle(i.pos,5,2,PI*2,PI*2)
			play('hit')
		
		}
		if(e.isColliding.char.e)
		{
			i.pos.add(i.dir.mul(-i.speed))
		}
		if(e.isColliding.char.a)
		{ 
			color("yellow")
			i.life -= i.life

			let dano = 10 * jogador.level
			jogador.life -= 10 * jogador.level
			TextParticle(`HP -${dano}`,vec(jogador.pos),60,false)

			arc(i.pos,20,5,0,PI*2)
			play('explosion')
			//rect(i.pos,vec(5,5))
		}
		if(i.life > 0)
		{
			return false
		}
		else
		{
			orbs.push({
				pos : i.pos,
				got : false
			})
		
			return true
		}

	})

	remove(orbs,(o)=>{
			color('blue')
			let colisao = rect(o.pos,4,4)
			if(colisao.isColliding.char.a)
			{
				
				particle(vec(jogador.pos),10,2,0,PI*2)
				jogador.exp++
				play('coin')
				return true
			}
			else return false

	})

	remove(raios,(r)=>{
		color('transparent')
		let colisao = bar(r.pos.add(AngleToNormalizedVector(r.angle).mul(r.speed)),4,4,r.angle,0)
		if(colisao.isColliding.char.e)
		{
			r.ttl--
			r.angle = Deg2Rad(rndi(0,360))
		}
		else if(!r.pos.isInRect(0,0,janela.x,janela.y))
		{
			r.ttl--
			r.angle -= PI
		}
		return r.ttl <= 0
	})

	text(`
	life: ${jogador.life}
	level: ${jogador.level}
	exp: ${jogador.exp}/${jogador.level * 10}
	laser: ${habilidades.laser}
	arrow: ${habilidades.flecha}
	fireBall: ${habilidades.bolaFogo}
	snake: ${habilidades.cobra}
	`,0,10,{color:'green'})//,scale : {x:2,y:2}

	if(jogador.life <= 0) GameOver()
}

function update() {
	if (!ticks) {
		Init()
		
	}
	naLojinha ? Lojinha() : Gameloop()	
}

function Init()
{
	habilidades = {
		laser : 	0,
		bolaFogo : 	0,
		flecha : 	0,
		cobra:		0
	}
  	seconds = 0
  	jogador = {
    	pos:vec(janela.x /2, janela.y / 2),
    	target:vec(janela.x /2, janela.y / 2),
    	life:100,
    	exp:0,
    	level:1
  	}
	
	UparHabilidadeAleatoria()
	naLojinha = true
	//Lojinha()

}
function GameOver()
{
	
	inimigos = []
	ataquesMelee = []
	bolasFogo = []
	orbs = []
	raios = []
	cobras = []
	end("You died")

}
/**
 * 
 * @param {String} text 
 * @param {Number} ttl 
 * @param {Vector} pos 
 * @param {boolean} up 
 */
function TextParticle(text,pos,ttl,up)
{
	particulasTexto.push({
		txt: text,
		pos : pos,
		ttl : ttl,
		up: up
	})
}
function SpawnarInimigo()
{
  let v = vec(janela.x * rndi(0,2),rndi(0,janela.y))
  inimigos.push({
		pos: v,
		life:100 * (Number(difficulty)),
		speed:0.5,
		dir: vec(0,0)
  })
}

function AtaqueMelee(angle)
{
	let c = vec(jogador.pos)
	c.add(AngleToNormalizedVector(angle).mul(10 * Number(habilidades.laser)))
	// c.add(AngleToNormalizedVector(angle).mul(10 * jogador.level))
	
	ataquesMelee.push({
		p1 : vec(jogador.pos),
		p2 : c,
		ttl: 30
	})
}
function BolaDeFogo(angle)
{
	let pos = vec(jogador.pos)

	if(habilidades.bolaFogo>0)
	{
		bolasFogo.push({
			pos : pos,
			dir : AngleToNormalizedVector(angle),
			radius :  Number(habilidades.bolaFogo*2) ,
			 //radius : Number(jogador.level) * 5,
			ttl: 120
		})
	}

	
}
function Raio(angle)
{
	
	let pos = vec(jogador.pos)
	raios.push({
		pos : pos,
		angle : angle,
		ttl: Number(habilidades.flecha),
		speed : 1
	})
}
function AtirarCobra()
{
	
	cobras.push({
		pos: vec(jogador.pos),
		angle : 0,
		distance: 0,
		ttl: 60 * Number(habilidades.cobra) 
	})
	
}
function Lojinha()
{
	inimigos = []
	const escalaTxt = 2

	color('black')
	rect(input.pos,5,5)

	color('purple')
	let laser = rect(10,10,80,80)	
	let bfogo = rect(100,10,80,80)	
	
	let arrow = rect(10,100,80,80)	
	let cobra = rect(100,100,80,80)	
	
	let vida = rect(10,190,80,80) 	
	
	color('light_yellow')

	text("Laser",vec(15,15),{scale:{x:escalaTxt,y:escalaTxt}})
	text("Fire\nball",vec(105,20),{scale:{x:escalaTxt,y:escalaTxt}})

	text("Snake",vec(120,120),{scale:{x:escalaTxt,y:escalaTxt}})
	text("Arrow",vec(15,120),{scale:{x:escalaTxt,y:escalaTxt}})

	text("Life",vec(20,210),{scale:{x:escalaTxt,y:escalaTxt}})

	color('black')
	text("Touch to\nchoose\na power \nto level\nup!",vec(30,310),{scale:{x:3,y:3}})

	if(laser.isColliding.rect.black && input.isJustPressed && !input.isJustReleased)
	{
		habilidades.laser++
		naLojinha = false;

	}
	else if(bfogo.isColliding.rect.black && input.isJustPressed && !input.isJustReleased)
	{
		habilidades.bolaFogo++
		naLojinha = false;

	}
	else if(arrow.isColliding.rect.black && input.isJustPressed && !input.isJustReleased)
	{
		habilidades.flecha++
		naLojinha = false;

	}
	else if(cobra.isColliding.rect.black && input.isJustPressed && !input.isJustReleased)
	{
		habilidades.cobra++
		naLojinha = false;

	}
	else if(vida.isColliding.rect.black && input.isJustPressed && !input.isJustReleased)
	{
		jogador.life *= 2
		naLojinha = false;
	}
	//particle(input.pos,100,100,0,PI *2)
	
	
}
/**
 * @param {Vector} vec1 
 * @param {Vector} vec2 
 */
function VectorsToAngle(vec1, vec2)
{
  	return atan2(vec2.y - vec1.y,vec2.x - vec1.x)
}
/** @param {Number} angle */
function AngleToNormalizedVector(angle)
{
  	return vec(cos(angle),sin(angle))
}
/** @param {Number} degrees */
function Deg2Rad(degrees)
{
  	return Number(degrees * PI / 180)
}


addEventListener("load", onLoad);