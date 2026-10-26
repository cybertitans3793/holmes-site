# Unit pages for Holmes Sims. Lesson codes go in 'code' (leave '' until known). Tasks are HTML.
PHET = 'PhET Interactive Simulations, University of Colorado Boulder (phet.colorado.edu), CC BY 4.0 / GPL.'

SIMS = {
    'fluids':  {'file': 'fl/out.html', 'kind': 'xl', 'ar': '1008 / 676',
                'credit': 'Under Pressure, Flow and Water Tower are HTML5 ports of PhET “Fluid Pressure and Flow”; Buoyancy is inspired by PhET “Buoyancy”. ' + PHET + ' Other tabs are original.'},
    'green':   {'file': 'gh/out.html', 'kind': 'xl', 'ar': '1008 / 676',
                'credit': 'Greenhouse tabs are original, with ideas from PhET “Greenhouse Effect” and “Blackbody Spectrum”. ' + PHET},
    'scope':   {'file': 'es/Charging and the Electroscope.html', 'kind': 'panel', 'ar': '1100 / 650', 'credit': 'Charging &amp; the Electroscope is original.'},
    'hockey':  {'file': 'efh/Electric Field Hockey.html', 'kind': 'plain', 'ar': '700 / 680', 'credit': 'Electric Field Hockey is an HTML5 port of the PhET sim. ' + PHET},
    'fission': {'file': 'nfout/Nuclear Fission.html', 'kind': 'plain', 'ar': '4 / 3', 'credit': 'Nuclear Fission is an HTML5 port of the PhET sim. ' + PHET},
    'star':    {'file': 'stars/Star Life Cycle.html', 'kind': 'panel', 'ar': '1100 / 650', 'credit': 'Star Life Cycle is original.'},
    'mman':    {'file': 'mm/The Moving Man.html', 'kind': 'plain', 'ar': '1.27', 'credit': 'The Moving Man is an HTML5 port of the PhET sim. ' + PHET},
    'cart':    {'file': 'units/sims/push-cart.html', 'kind': 'plain', 'ar': '960 / 600', 'credit': 'Push the Cart is original.'},
    'lander':  {'file': 'llout/Lunar Lander.html', 'kind': 'plain', 'ar': '800 / 650', 'credit': 'Lunar Lander is an HTML5 port of the PhET sim. ' + PHET},
    'maze':    {'file': 'mz/Maze Game.html', 'kind': 'plain', 'ar': '720 / 600', 'credit': 'Maze Game is an HTML5 port of the PhET sim. ' + PHET},
    'kepler':  {'file': 'units/sims/kepler.html', 'kind': 'plain', 'ar': '1060 / 673', 'credit': 'Kepler’s First Law: Drawing Ellipses is original, based on the string-and-pushpin ellipse lab.'},
    'curve':   {'file': 'units/sims/circ-curve.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': 'Car on a Curve, Vertical Circles, Conical Pendulum, Turntable and Orbits &amp; Gravity are original.'},
    'vcirc':   {'file': 'units/sims/circ-vertical.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'conical': {'file': 'units/sims/circ-conical.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'turn':    {'file': 'units/sims/circ-turntable.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'orbit':   {'file': 'units/sims/circ-orbits.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'crate':   {'file': 'units/sims/circ-crate.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': 'Pulling a Crate, Energy Track, Spring Launcher, Power and Spring + Gravity are original.'},
    'track':   {'file': 'units/sims/circ-track.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'launch':  {'file': 'units/sims/circ-launcher.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'power':   {'file': 'units/sims/circ-power.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'hang':    {'file': 'units/sims/circ-hang.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'phetE':   {'file': 'units/sims/phet-energy.html', 'kind': 'plain', 'ar': '16 / 10', 'credit': 'Energy Skate Park: Basics, Masses and Springs and Pendulum Lab: ' + PHET},
    'crash':   {'file': 'units/sims/circ-crash.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': 'Crash Test, Collision Carts, Bouncing Ball, Ballistic Pendulum, 2D Collisions and Ball Stack are original.'},
    'carts':   {'file': 'units/sims/circ-carts.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'bounce':  {'file': 'units/sims/circ-bounce.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'ballis':  {'file': 'units/sims/circ-ballistic.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'hockey2': {'file': 'units/sims/circ-hockey.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'stack':   {'file': 'units/sims/circ-stack.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'puck':    {'file': 'units/sims/circ-puck.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': 'Puck in Space, Balanced Forces, Inertia on a Cart, When Do They Meet? and Springs are original.'},
    'balance': {'file': 'units/sims/circ-balance.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'cartball':{'file': 'units/sims/circ-cartball.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'meet':    {'file': 'units/sims/circ-meet.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'chase':   {'file': 'units/sims/circ-chase.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': 'Chase &amp; Collide, Up and Down, Brake or Go?, Force &amp; Motion Graphs and Elevator Scale are original.'},
    'updown':  {'file': 'units/sims/circ-updown.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'brake':   {'file': 'units/sims/circ-brake.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'fgraphs': {'file': 'units/sims/circ-fgraphs.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'elevator':{'file': 'units/sims/circ-elevator.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'blocks':  {'file': 'units/sims/circ-blocks.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': 'Push Two Blocks is original.'},
    'anglepull':{'file': 'units/sims/circ-anglepull.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': 'Pull at an Angle, Inclines, River Crossing and Projectiles are original.'},
    'incline': {'file': 'units/sims/circ-incline.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'river':   {'file': 'units/sims/circ-river.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'proj':    {'file': 'units/sims/circ-proj.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'spin':    {'file': 'units/sims/circ-spin.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': 'Spinning Wheel, Torque, Rotational Inertia, Massive Pulley, Rolling Race and Angular Momentum are original.'},
    'torque':  {'file': 'units/sims/circ-torque.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'inertia': {'file': 'units/sims/circ-inertia.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'mpulley': {'file': 'units/sims/circ-mpulley.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'roll':    {'file': 'units/sims/circ-roll.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'angmom':  {'file': 'units/sims/circ-angmom.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'pressure': {'file': 'units/sims/circ-pressure.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': 'Pressure &amp; Depth, Floating &amp; Sinking, Scale &amp; Beaker, Pipe Flow, Leaky Tank and Terminal Velocity are original.'},
    'float':   {'file': 'units/sims/circ-float.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'scale':   {'file': 'units/sims/circ-scale.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'pipe':    {'file': 'units/sims/circ-pipe.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'tank':    {'file': 'units/sims/circ-tank.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'stokes':  {'file': 'units/sims/circ-stokes.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'shm':     {'file': 'units/sims/circ-shm.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': 'Mass on a Spring, Pendulum, SHM &amp; the Circle, Clay on a Block and Damping &amp; Resonance are original.'},
    'pend':    {'file': 'units/sims/circ-pend.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'circle':  {'file': 'units/sims/circ-circle.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'clay':    {'file': 'units/sims/circ-clay.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'reson':   {'file': 'units/sims/circ-reson.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'springs': {'file': 'units/sims/circ-springs.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'pulleys': {'file': 'units/sims/circ-pulleys.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': 'Pulleys and Box on a Truck are original.'},
    'truck':   {'file': 'units/sims/circ-truck.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'vectors': {'file': 'units/sims/circ-vectors.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': 'Adding Forces and Two Ropes are original.'},
    'ropes':   {'file': 'units/sims/circ-ropes.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': ''},
    'cannon':  {'file': 'units/sims/circ-cannon.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': 'Newton’s Mountain is original.'},
    'gears':   {'file': 'units/sims/circ-gears.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': 'Gears is original.'},
    'assist':  {'file': 'units/sims/circ-assist.html', 'kind': 'plain', 'ar': '1000 / 640', 'credit': 'Gravity Assist is original.'},
    'phetM':   {'file': 'units/sims/phet-momentum.html', 'kind': 'plain', 'ar': '16 / 10', 'credit': 'Collision Lab and Momentum Lab: ' + PHET},
    'solar':   {'file': 'single/my-solar-system.html', 'kind': 'plain', 'ar': '4 / 3', 'credit': 'My Solar System is a single-file copy of the open-source sim (old PhET-style constants). ' + PHET},
}

UNITS = {
# ------------------------------------------------------------------ AP PHYSICS 1
'P1-02': {'course': 'AP Physics 1 / IB', 'num': '02', 'title': 'Newton’s Second Law', 'tabs': [
    {'code': '', 'name': 'Moving Man', 'sim': 'mman', 'tasks': [
        'Start the man at −4 m with a constant velocity of +2 m/s. Sketch the x–t and v–t graphs before you press play, then compare.',
        'From rest, give him an acceleration of +1 m/s². What shape is the x–t graph? What does the area under the v–t graph tell you?',
        'Make him slow down while he is still moving to the right. What signs do v and a have?',
        'Make the v–t graph a flat line at −1.5 m/s. Is he speeding up, slowing down, or neither?']},
    {'code': '', 'name': 'Chase & Collide', 'sim': 'chase', 'tasks': [
        '<b>Police chase.</b> A speeder passes a parked police car at 30 m/s. The police car starts right away at 3 m/s². Write x(t) for both, then find when and where it catches up. Check with the sim.',
        'Show that with no wait the police are always going exactly twice the speeder’s speed when they catch up. Use the v–t graph: what do the two areas have to be?',
        'When is the gap between them the biggest? Find it on the v–t graph and explain.',
        '<b>Head-on.</b> Car A drives at a constant 10 m/s toward car B, 200 m away, which starts from rest and accelerates toward A at 2 m/s². Set up the quadratic and solve. Why do you throw out one root?',
        '<b>Will it rear-end?</b> A car at 30 m/s is 30 m behind a truck going 15 m/s and brakes at 6 m/s². Does it hit? Now try a wet road (3 m/s²). Why only the <i>relative</i> speed matters.']},
    {'code': '', 'name': 'Up and Down', 'sim': 'updown', 'tasks': [
        '<b>Predict, then check.</b> At the very top of its path, what are the ball’s velocity and acceleration? Use the v–t graph.',
        'A ball is thrown up at 15 m/s from a 20 m cliff. Find the max height, the time to hit the bottom and the speed there.',
        'Throw it up at 10 m/s, then down at 10 m/s. Compare the speeds at the bottom. Explain with v² = v<sub>0</sub>² + 2gh.',
        '<b>Drop one, throw one.</b> Ball A is dropped from 45 m as ball B is thrown up at 20 m/s. Show that they pass at t = H/v<sub>0</sub>. Why does the ½gt² cancel?',
        'What is the slowest B can be thrown and still pass A in the air?']},
    {'code': '', 'name': 'Brake or Go?', 'sim': 'brake', 'tasks': [
        '<b>Derive</b> a = μg for a braking car from a free-body diagram and F = ma. Why doesn’t the car’s mass matter?',
        'Double the speed. By what factor does the reaction distance change? The braking distance? Predict, then check with the ×2 line.',
        'Use the presets: how much longer is the stopping distance on a wet road? On ice? While texting (2 s reaction)?',
        '<b>Yellow light.</b> Find a speed and distance where you can neither stop nor make it through (the dilemma zone). What could engineers change to fix it?',
        'On the v–t graph, which area is the reaction distance and which is the braking distance? Calculate both from the graph.']},
    {'code': '', 'name': 'Push the Cart', 'sim': 'cart', 'tasks': [
        'Set both μ to 0. Double the force. Predict what happens to <i>a</i>, then run it.',
        'Keep F = 12 N and double the mass. What happens to <i>a</i>?',
        'Find the smallest force that starts a 4.0 kg cart moving when μ<sub>s</sub> = 0.30. Once it is moving, what is the net force?',
        'While the cart is moving, lower F until it equals kinetic friction. What does the v–t graph do? Why doesn’t the cart stop?']},
    {'code': '', 'name': 'Force & Motion Graphs', 'sim': 'fgraphs', 'tasks': [
        '<b>Translate.</b> Use “Speed up, cruise, stop.” Sketch the a–t, v–t and x–t graphs from the F–t graph before you watch them draw.',
        'Set F<sub>2</sub> = 0. What does the cart do from 3 to 6 s, and what law tells you that?',
        '<b>Turn around.</b> The force points backward the whole time. When is the cart moving forward? When does it turn around, and what does the x–t graph look like there?',
        'Double the mass. Which graphs change, and by what factor?',
        'Make the cart end at x = 0 at 9 s. Describe your forces and explain using areas under the v–t graph.']},
    {'code': '', 'name': 'Elevator Scale', 'sim': 'elevator', 'tasks': [
        'Draw the free-body diagram of a person on a scale in an elevator. Which force does the scale read?',
        '<b>Ride up.</b> Predict whether the scale reads more, less or the same as mg while starting, cruising and stopping. Then check each.',
        'Find two different parts of a ride (up or down) where the scale reads <i>more</i> than mg. What do they have in common?',
        'A 60 kg student’s scale reads 48 kg. Find the elevator’s acceleration. Which ways could the elevator be moving?',
        '<b>Cable snaps.</b> Why does the scale read zero, even if the elevator was still moving up? Is gravity still acting?']},
    {'code': '', 'name': 'Lunar Lander', 'sim': 'lander', 'tasks': [
        'Find the thrust that makes the lander hover. How does that thrust compare with the lander’s weight on the Moon?',
        'Can the lander move down at a steady speed with the engine on? What is the net force then?',
        'Turn on the force vectors. While the lander slows its fall, which way does the net force point?',
        'Land at under 2 m/s with as little fuel as you can. Describe your strategy using F<sub>net</sub> = ma.']},
]},
'P1-04': {'course': 'AP Physics 1 / IB', 'num': '04', 'title': 'Motion and Forces in 2D', 'tabs': [
    {'code': '', 'name': 'Maze Game', 'sim': 'maze', 'tasks': [
        'Steer the ball with <b>position</b> only. Easy? Now switch to <b>velocity</b>. What does the arrow you drag now control?',
        'Switch to <b>acceleration</b>. Why is it so much harder to stop at the goal?',
        'With acceleration control, how do you make the ball turn a corner at constant speed? Which way must the acceleration point?',
        'Watch the velocity and acceleration arrows. Can the ball move one way while it accelerates the other way? When?']},
    {'code': '', 'name': 'Adding Forces', 'sim': 'vectors', 'tasks': [
        '<b>Components first.</b> F<sub>1</sub> = 60 N at 20° and F<sub>2</sub> = 40 N at 110°. Fill in the component table on paper, then check it against the sim.',
        'Keep both forces the same size and change only the angle between them. When is F<sub>net</sub> biggest? Smallest? Graph F<sub>net</sub> vs θ<sub>2</sub> to check.',
        'Put F<sub>2</sub> in quadrant II so ΣF<sub>x</sub> is negative. Your calculator’s tan<sup>−1</sup> gives the wrong direction. Use step 3 to fix it.',
        '<b>Equal at 120°.</b> Three 50 N forces 120° apart: why is the net force zero? Use the equilibrant in step 5.',
        'Switch between Components, Tip to tail and Parallelogram. Explain why all three give the same F<sub>net</sub>.']},
    {'code': '', 'name': 'Two Ropes', 'sim': 'ropes', 'tasks': [
        '<b>IB classic.</b> A 5 kg mass hangs from the middle of a rope pulled from both ends. Graph T vs θ. What happens to T as you try to pull the rope flat?',
        'Explain with 2T sinθ = mg why no force, however big, can make the rope perfectly horizontal.',
        'At what angle is the tension equal to the weight? Solve first, then check.',
        '<b>Sign on two cables.</b> With θ<sub>1</sub> = 30° and θ<sub>2</sub> = 60°, which cable has more tension? Write ΣF<sub>x</sub> = 0 and ΣF<sub>y</sub> = 0 and solve before you look.',
        'Make both cable angles equal. Are the tensions equal now? Why?']},
    {'code': '', 'name': 'Pull at an Angle', 'sim': 'anglepull', 'tasks': [
        '<b>Spot the error.</b> A student writes N = mg for a sled pulled by a rope at 30°. Use the free-body diagram to fix it.',
        'Derive F = μmg/(cosθ + μ sinθ) for pulling at constant velocity, then check it against the sim for one angle.',
        'Graph F vs θ. Why does the pull needed go down at first, then up? Find the best angle and compare it with tan<sup>−1</sup>(μ).',
        '<b>Given pull.</b> A 100 N pull at 30° on a 20 kg sled (μ<sub>k</sub> = 0.30). Find N, friction and a.',
        'At 60°, how hard would you have to pull to lift the 20 kg sled off the ground? Check with the Given pull mode.']},
    {'code': '', 'name': 'Inclines', 'sim': 'incline', 'tasks': [
        'Draw the free-body diagram with axes tilted along the ramp. Which force do you split into components, and why does “along the ramp” get sinθ?',
        '<b>Will it slide?</b> Slowly raise the ramp angle. At what angle does the block slip? Show that tanθ = μ<sub>s</sub> and that the mass doesn’t matter.',
        'Graph friction vs θ. Explain both parts of the graph: why it rises, then why it suddenly drops.',
        'Once it slides, find a = g(sinθ − μ<sub>k</sub>cosθ) on paper for θ = 40°, then check.',
        '<b>Pushed up.</b> Find the push needed to move a 5 kg block up a 25° ramp at constant velocity (μ<sub>k</sub> = 0.40). Which way does friction point, and why?']},
    {'code': '', 'name': 'River Crossing', 'sim': 'river', 'tasks': [
        '<b>Aim straight across.</b> A boat goes 4 m/s in a 3 m/s current across a 60 m river. How long does it take, and how far downstream does it land?',
        'Increase the current. Does the crossing time change? Explain using components.',
        '<b>Land straight across.</b> Find the angle to aim upstream so the boat lands directly opposite. Why does it take longer?',
        'Make the current faster than the boat. Can the boat still land straight across? Why not?',
        '<b>Plane.</b> A plane flies at 500 km/h with a 100 km/h crosswind. Which heading gets it due north, and what is its ground speed?']},
    {'code': '', 'name': 'Projectiles', 'sim': 'proj', 'tasks': [
        '<b>Off a cliff.</b> A ball rolls off a 45 m cliff at 10 m/s. Find the time in the air and how far out it lands. Compare its fall time with the grey dropped ball.',
        'Double the launch speed. What happens to the time in the air and to the distance? Use the ×2 line to check.',
        '<b>Level ground.</b> Show that 30° and 60° give the same range. Which angle gives the most range, and which stays in the air longer?',
        'At the top of the path, what are v<sub>x</sub>, v<sub>y</sub> and the acceleration?',
        '<b>From a height.</b> Launch at 15 m/s, 30° from a 20 m cliff. Find the time, range and impact speed. Is 45° still the best angle here?',
        '<b>Hit the target.</b> A target is 30 m away and 5 m up. Find the launch speed needed at 45°, then find an angle that needs less.']},
]},
'P1-05': {'course': 'AP Physics 1 / IB', 'num': '05', 'title': 'Circular Motion and Gravity', 'tabs': [
    {'code': '', 'name': 'Car on a Curve', 'sim': 'curve', 'tasks': [
        '<b>Predict, then check.</b> If the car’s speed doubles, by what factor does the friction force it needs change? Write your prediction, then read the ×2 line under the graph. Justify it with a<sub>c</sub> = v²/r.',
        '<b>Claim.</b> A student says a heavier car is more likely to skid because it needs more force to turn. Use steps 3–5 to explain why the fastest safe speed does not depend on mass.',
        'Graph <i>F needed</i> vs <i>v</i>. Where the curve crosses the dashed f<sub>s,max</sub> line, read the speed. Compare it with v<sub>max</sub> in step 5.',
        '<b>Banked road.</b> Set r = 80 m and θ = 20°. Find the design speed. Then drive 5 m/s faster: which way would the car slide, and which way would friction have to point to stop it?',
        '<b>Derive</b> v<sub>0</sub> = √(g r tanθ) on paper, starting from a free-body diagram, then check your expression against step 6.']},
    {'code': '', 'name': 'Vertical Circles', 'sim': 'vcirc', 'tasks': [
        '<b>Ball on a string, top.</b> Find the slowest speed that keeps the string tight. Show on paper why setting T = 0 gives v<sub>min</sub> = √(gr).',
        'Keep the same speed and compare the tension at the top and at the bottom. Which is bigger, and by how much? Write the difference in terms of m and g.',
        '<b>Coaster loop.</b> What speed at the top makes riders feel weightless (N = 0)? What speed at the bottom makes them feel 3 g’s?',
        '<b>Car over a hill.</b> Graph N vs v. In a sentence, explain why the car “gets light” at the top, then find the speed where it leaves the road.',
        '<b>Spot the error.</b> A student writes “at the top of the loop, the centripetal force and gravity both act on the car, so N + mg + F<sub>c</sub> = 0.” Use the free-body diagram to explain what’s wrong.']},
    {'code': '', 'name': 'Conical Pendulum', 'sim': 'conical', 'tasks': [
        'Draw the free-body diagram on paper before you look. Then check: which part of the tension supplies the centripetal force? Which part holds the bob up?',
        'Change only the mass. What happens to the speed and the period? Point to the step in the work where m cancels.',
        'Graph T vs θ. Explain why the tension shoots up as θ approaches 90°. Could the string ever be exactly horizontal?',
        'Set L = 1.0 m and θ = 10°. Compare the period with a simple pendulum, 2π√(L/g). Why are they so close at small angles?',
        '<b>Derive</b> v = √(g r tanθ) by writing Newton’s 2nd law in the vertical and horizontal directions and dividing.']},
    {'code': '', 'name': 'Turntable', 'sim': 'turn', 'tasks': [
        'At 33 rpm, find the farthest radius a coin can sit without slipping (step 6). Move the coin past it and watch which way it leaves.',
        '<b>Resolve the contradiction.</b> a<sub>c</sub> = v²/r makes it look like bigger r means smaller a<sub>c</sub>, but the outer coin slips first. Use ω and both forms of a<sub>c</sub> in step 3 to explain.',
        'Graph <i>F needed</i> vs r, then vs rpm. Compare the ×2 readouts. Which graph is a straight line through the origin, and why?',
        'Double the coin’s mass. Does r<sub>max</sub> change? Explain using step 6.',
        'Predict r<sub>max</sub> at 45 rpm and at 78 rpm using r<sub>max</sub> ∝ 1/ω², then check with the buttons.']},
    {'code': '', 'name': 'Newton’s Mountain', 'sim': 'cannon', 'tasks': [
        'Fire at 2, 6 and 9 km/s. Describe each path. Why does a fast enough cannonball never land?',
        '<b>Derive</b> v = √(GM/r) for a circular orbit by setting gravity equal to mv²/r. Check your answer with the Circular orbit preset.',
        'Newton’s idea: the ball is <i>always</i> falling. Explain how something can fall the whole time and never get closer to the ground.',
        'Raise the mountain. Does the circular orbit speed go up or down? Explain with your expression from task 2.',
        'Fire at 11 km/s. What is special about escape speed, and how does it compare with √2 × v<sub>circ</sub>?']},
    {'code': '', 'name': 'Orbits & Gravity', 'sim': 'orbit', 'tasks': [
        '<b>ISS.</b> What is g at the station’s altitude, as a percentage of surface g? Then explain why astronauts feel weightless anyway.',
        'Double h, then instead double r (the distance from the <i>center</i>). Which one makes the gravity force exactly ¼? Explain why.',
        'Find the altitude where the period is 24 h (geostationary). Check with the preset.',
        'Change the satellite’s mass. What happens to v and T? Use step 4 to explain.',
        '<b>IB · Kepler’s 3rd law.</b> Graph T²/r³ against h. What stays constant, and what would change it? Use your result to find the mass of a planet from one orbit.']},
    {'code': '', 'name': 'Gears', 'sim': 'gears', 'tasks': [
        'A 20-tooth gear turns a 40-tooth gear at 60 rpm. Predict the speed of the big gear, then check. Which way does it turn?',
        '<b>Explain</b> why the rims share the same speed but not the same ω. Use v = ωr in step 2.',
        'Add an idler gear in the middle. Does its size change the last gear’s speed? What does it change?',
        '<b>Bike chain.</b> Which combination is best for climbing a hill: big chainring and small cog, or small chainring and big cog? Use the bike speed to explain.',
        'Graph rpm<sub>2</sub> vs N<sub>2</sub>. What does the ×2 line say, and why is it inversely proportional?']},
    {'code': '', 'name': 'My Solar System', 'sim': 'solar', 'tasks': [
        'Choose the <b>sun and planet</b> preset and turn on Show Traces. Is the orbit a circle? Change the planet’s v<sub>y</sub> until it is as round as you can make it.',
        'Give the planet a bit less speed. Where on its orbit is it fastest? Where is it slowest?',
        'Double the sun’s mass. Does the planet need more or less speed for a circular orbit at the same distance? About how many times more?',
        'Try the <b>sun, planet, moon</b> preset. What keeps the moon going around the planet while the planet goes around the sun?']},
]},
'P1-06': {'course': 'AP Physics 1 / IB', 'num': '06', 'title': 'Work, Power, and Energy', 'tabs': [
    {'code': '', 'name': 'Pulling a Crate', 'sim': 'crate', 'tasks': [
        '<b>Predict, then check.</b> Will pulling at 30° or straight along the floor give the crate more speed after 5 m? Decide first, then graph v<sub>f</sub> vs θ and find the best angle.',
        'Explain the shape of that graph using steps 1–3: pulling up at an angle shrinks the useful part of F, but what does it do to friction?',
        'Set μ<sub>k</sub> = 0. Now which angle is best? Why does the answer change?',
        '<b>Area under the graph.</b> Use the F–x graph to explain why W<sub>F</sub> = Fd cosθ and why friction’s work is negative.',
        '<b>Claim.</b> A student says the normal force does work because it’s a big force. Use step 4 to respond.']},
    {'code': '', 'name': 'Energy Track', 'sim': 'track', 'tasks': [
        '<b>Hill &amp; valley.</b> Start from rest at 8 m. Predict the speed at the bottom of the valley, then put B there and check. Does the cart’s mass matter?',
        '<b>System switch.</b> Flip between “Cart + Earth” and “Cart only.” Gravity shows up as U<sub>g</sub> in one and as W<sub>g</sub> in the other. Explain why both give the same v<sub>B</sub>.',
        '<b>Loop.</b> With R = 3 m, find the lowest start height that gets the cart around (step 5). Show on paper why it is 2.5R, not 2R.',
        '<b>Rough patch.</b> Graph v<sub>B</sub> vs h<sub>A</sub> with B past the rough patch. How much higher must the cart start to make up for the friction? Explain with ΔE<sub>th</sub> = μ<sub>k</sub>mgd.',
        '<b>Spring bumper.</b> Double the start height. By what factor does the maximum compression change? Predict with ½kx² = mgh, then check with ×2.']},
    {'code': '', 'name': 'Spring Launcher', 'sim': 'launch', 'tasks': [
        'Double the compression. What happens to the stored energy, the launch speed and the ramp height? Check each with the ×2 line.',
        'Use the F–x graph to explain why the stored energy is ½kx², not kx².',
        '<b>Straight up.</b> Change the mass. Why does the height depend on m here, but the speed at B on the Energy Track didn’t?',
        'Find the compression that launches a 0.2 kg ball 2.0 m above the release point with k = 500 N/m. Solve on paper first.']},
    {'code': '', 'name': 'Power', 'sim': 'power', 'tasks': [
        '<b>Motor.</b> A 2000 W motor and a 1000 W motor lift the same load the same height. Compare the work each does and the time each takes.',
        'Show that P = Fv gives the same lifting speed as h/t (step 3).',
        '<b>Stairs.</b> Time yourself climbing a real staircase and measure its height. Enter your numbers: what is your power in watts and horsepower?',
        'Graph P vs t. What shape is it, and what does the ×2 line say about doubling the time?']},
    {'code': '', 'name': 'Spring + Gravity', 'sim': 'hang', 'tasks': [
        '<b>Classic FRQ.</b> A mass is attached to an unstretched spring and released. Show that it falls 2mg/k, twice the equilibrium stretch.',
        'Where is the mass moving fastest? Use the energy bars at different B positions to support your answer.',
        'At the lowest point, the mass is momentarily at rest. Is it in equilibrium there? Compare kx<sub>max</sub> with mg.',
        'Switch to “Lowered gently.” Where did the extra energy go when the mass settled at x<sub>eq</sub> instead of bouncing?']},
    {'code': '', 'name': 'Springs', 'sim': 'springs', 'tasks': [
        'Use the F–x graph: the shaded area is the stored energy. Double the mass. By what factor does the stored energy change? Predict, then check.',
        '<b>Series vs parallel.</b> Hang the same mass from two equal springs both ways. Which setup stores more energy? Why?',
        'Graph U<sub>s</sub> vs m. Why is it not a straight line?',
        'Two springs in series store more energy than one of them alone with the same mass. Explain using x and ½k<sub>eff</sub>x².']},
    {'code': '', 'name': 'PhET Sims', 'sim': 'phetE', 'tasks': [
        '<b>Energy Skate Park.</b> Turn on the bar graph and the speed. Where is the skater fastest? Add friction: where does the energy go?',
        '<b>Masses and Springs</b> (Energy screen). Watch the energy bars as the mass bounces. When is the spring energy biggest?',
        '<b>Pendulum Lab</b> (Energy screen). Compare the speed at the bottom for two different release heights.']},
]},
'P1-07': {'course': 'AP Physics 1 / IB', 'num': '07', 'title': 'Impulse and Momentum', 'tabs': [
    {'code': '', 'name': 'Crash Test', 'sim': 'crash', 'tasks': [
        '<b>Predict, then check.</b> A crumple zone doubles the collision time. What happens to the impulse? To the average force? Use the ×2 line to check both.',
        '<b>Claim.</b> A student says the crumple zone reduces the car’s change in momentum. Use steps 1–2 to explain what it really changes.',
        'Switch to “bounces back.” Explain why bouncing off the wall makes the force bigger, even though the car ends up moving slower than it started.',
        'Use the F–t graph: the steel wall and the water barrels give the same area. Sketch both on paper and label which is which.',
        'How long must a 15 m/s crash last to keep a 70 kg passenger under 20 g’s? Solve first, then check.']},
    {'code': '', 'name': 'Collision Carts', 'sim': 'carts', 'tasks': [
        '<b>Elastic, equal masses, B at rest.</b> Predict both velocities after. Then make A twice as heavy and predict again.',
        '<b>Sticky.</b> Show that the total momentum is the same before and after but the kinetic energy is not. Where did the energy go?',
        'Make A and B move toward each other with equal and opposite momentum, then stick. What happens? Use step 2.',
        '<b>Explosion.</b> A 1 kg and a 3 kg cart push apart. Which gets the bigger speed? The bigger momentum? The bigger kinetic energy? Justify each.',
        'Compare the impulse on B with the impulse on A in any collision. What law does this show?']},
    {'code': '', 'name': 'Bouncing Ball', 'sim': 'bounce', 'tasks': [
        'Which gets the bigger impulse from the floor: a clay ball that sticks or a superball that bounces? Predict, then check with the presets.',
        '<b>System.</b> Is the ball’s momentum conserved during the bounce? Is the ball + Earth’s? Use step 5 to explain both answers.',
        'Shorten the contact time. What happens to the impulse and the force? Why do you bend your knees when you land?',
        'A ball loses 40% of its kinetic energy each bounce. What fraction of the drop height does it reach on the 2nd bounce? Check one bounce with the sim.']},
    {'code': '', 'name': 'Ballistic Pendulum', 'sim': 'ballis', 'tasks': [
        '<b>Two stages.</b> Explain why momentum is conserved in stage 1 but not stage 2, and why energy is conserved in stage 2 but not stage 1.',
        'A 10 g bullet swings a 2 kg block up 0.20 m. Work backward to find the bullet’s speed, then set it in the sim to check.',
        'Compare “sticks” and “bounces off” with the same bullet. Which swings higher? Use the impulse on the block to explain.',
        'Graph h vs v. Why is it not a straight line? What would you plot to get a straight line?']},
    {'code': '', 'name': '2D Collisions', 'sim': 'hockey2', 'tasks': [
        '<b>Velcro pucks.</b> Find the speed and direction after they stick. Show the x and y components separately before combining.',
        'A student adds the two speeds to get the speed after. Use the tip-to-tail diagram to explain why that’s wrong.',
        '<b>Glancing hit, equal masses, elastic.</b> Adjust A’s speed after until the kinetic energy is kept. What angle do the paths make?',
        'Make A’s speed after too big. Why does the sim say it’s impossible even though momentum still balances?']},
    {'code': '', 'name': 'Ball Stack', 'sim': 'stack', 'tasks': [
        'Try it for real: drop a tennis ball sitting on a basketball. How high does the tennis ball go compared with the drop height?',
        'Show that if M is much bigger than m, the top ball leaves at 3u and rises to 9h.',
        'With equal masses, what happens to each ball? Explain with step 3.']},
    {'code': '', 'name': 'Gravity Assist', 'sim': 'assist', 'tasks': [
        'Watch from the planet, then from the Sun. In which view does the spacecraft’s speed stay the same? Why is that like an elastic collision?',
        'Make a full U-turn. Show that the speed out is v + 2U, like a ball bouncing off the front of a moving train.',
        'Set the planet’s speed to 0. Does the spacecraft still speed up? Explain.',
        'The spacecraft gains kinetic energy. Where does it come from? Use step 4 and conservation of momentum.']},
    {'code': '', 'name': 'PhET Collision Lab', 'sim': 'phetM', 'tasks': [
        '<b>1D:</b> set elasticity to 100%. Make a heavy ball hit a light one at rest. Which ball moves faster afterward?',
        '<b>1D:</b> set elasticity to 0%. Turn on kinetic energy. What fraction is lost when equal masses stick?',
        '<b>2D:</b> turn on the momentum vectors and the total. Make a glancing collision. Is the total momentum vector the same before and after?']},
]},
'P1-09': {'course': 'AP Physics 1 / IB', 'num': '09', 'title': 'Fluids', 'tabs': [
    {'code': '', 'name': 'Pressure & Depth', 'sim': 'pressure', 'tasks': [
        '<b>Predict, then check.</b> Find the absolute and gauge pressure 5.0 m under water. How deep must you go for the pressure to double?',
        'Compare the three containers at the same depth. Why doesn’t the shape matter?',
        'Graph P vs h for water, then for mercury. What does the slope tell you?',
        '<b>U-tube.</b> 20 cm of oil (800 kg/m³) sits on water. Find the water height above the boundary on the other side. Which side is higher, and why?',
        '<b>Hydraulic lift.</b> A 100 N push on a 10 cm² piston. Find the force on a 500 cm² piston and how far it rises when you push 20 cm. Show that no energy is gained.']},
    {'code': '', 'name': 'Under Pressure', 'sim': 'fluids', 'select': 'Under Pressure', 'tasks': [
        'Put pressure gauges at the surface, 1 m down and 2 m down. How much does the pressure go up per meter? Compare with ρg.',
        'Switch to an odd-shaped pool. Is the pressure at the same depth still the same? Why doesn’t the shape matter?',
        'Turn the atmosphere off. What happens to every reading? What stays the same?',
        'Mystery pool: use two gauges at different depths to find the unknown fluid’s density.']},
    {'code': '', 'name': 'Hydraulics & Manometers', 'sim': 'fluids', 'select': 'Hydraulics & Manometers', 'tasks': [
        'Hydraulic lift: compare the force on the big piston with the force you apply. Is the ratio the same as the area ratio?',
        'When the small piston moves down 10 cm, how far does the big piston go up? Explain with work.',
        'U-tube: add the second liquid. Measure both heights above the boundary and find the second liquid’s density.',
        'Gas tank manometer: read the height difference and find the gas’s gauge pressure. Is it more or less than air pressure?',
        'Siphon: raise the top of the tube. Why can’t a water siphon work over a top higher than about 10 m?']},
    {'code': '', 'name': 'Floating & Sinking', 'sim': 'float', 'tasks': [
        '<b>Floating.</b> Show that the fraction under the surface is ρ<sub>obj</sub>/ρ<sub>fluid</sub>. What fraction of an ice cube is under water?',
        'Move a floating block from fresh water to salt water. Does the buoyant force change? Does the fraction under the surface?',
        '<b>Tied under.</b> A 2.0 L block (600 kg/m³) is held under by a string tied to the bottom. Draw the free-body diagram and find the tension.',
        '<b>Denser than water.</b> Find the apparent weight of a 2.0 L aluminum block hanging in water. Then let it go: find its acceleration (ignoring drag).',
        '<b>Claim.</b> “The deeper an object sinks, the bigger the buoyant force.” When is this true, and when isn’t it?']},
    {'code': '', 'name': 'Buoyancy', 'sim': 'fluids', 'select': 'Buoyancy', 'tasks': [
        'Predict what fraction of a block with half the density of water floats under the surface. Then test it.',
        'Push a block all the way under, then deeper. Does the buoyant force keep growing?',
        'Compare two blocks: same size but different mass, then same mass but different size. Which pairs feel the same buoyant force?',
        '<b>Boat &amp; cargo:</b> predict how much cargo the boat can carry before it sinks, using its volume. Then load it.']},
    {'code': '', 'name': 'Scale & Beaker', 'sim': 'scale', 'tasks': [
        '<b>Classic FRQ.</b> Lower the block halfway in. Predict how each scale reading changes, then check. Use free-body diagrams for the block and for the beaker.',
        'Where does the weight “lost” by the top scale go? Use Newton’s third law.',
        'Graph both readings vs how far the block is in. Why do both graphs go flat once the block is fully under?',
        'Show that the two readings always add up to (M + m)g.']},
    {'code': '', 'name': 'Scales', 'sim': 'fluids', 'select': 'Scales', 'tasks': [
        'Lower a hanging block into the water. By how much does the spring scale reading drop? Compare with the buoyant force.',
        'Watch the scale under the beaker at the same time. Where did the “missing” weight go? Use Newton’s third law.',
        'Tied mode: draw the free-body diagram of the block. Check the string tension against your diagram.',
        'Overflow can: compare the weight of the water that spills out with the buoyant force.']},
    {'code': '', 'name': 'Pipe Flow', 'sim': 'pipe', 'tasks': [
        '<b>Continuity.</b> Water at 2.0 m/s enters a pipe that narrows to ¼ of the area. Find the speed in the narrow part and the volume flow rate.',
        '<b>Level pipe.</b> Is the pressure higher in the wide part or the narrow part? Explain with Bernoulli’s equation and the budget bars.',
        '<b>Same width, uphill.</b> Does the speed change? Does the pressure? Explain.',
        'Find a setting where the pressure in part 2 would have to be negative. What does that tell you is physically impossible?']},
    {'code': '', 'name': 'Flow', 'sim': 'fluids', 'select': 'Flow', 'tasks': [
        'Squeeze one part of the pipe. Use the speed readouts to check A₁v₁ = A₂v₂.',
        'Put pressure gauges in the wide and narrow parts. Where is the pressure lower? Use the energy bars to explain.',
        'Raise one end of the pipe. How do the bars change between the low end and the high end?',
        'Venturi tubes: use the difference in water heights to find the speed in the narrow part.']},
    {'code': '', 'name': 'Leaky Tank', 'sim': 'tank', 'tasks': [
        'Use Bernoulli to show that water leaves a hole a depth h below the surface at v = √(2gh). Check for h = 1.8 m.',
        'The hole is 1.25 m above the ground. Where does the stream land? Treat it as a horizontal projectile.',
        'As the tank drains, what happens to the speed, the landing spot and the flow rate?',
        '<b>Sealed + pumped.</b> Add pressure on top. Which term in Bernoulli’s equation changed?',
        '<b>Three holes.</b> Which hole shoots farthest? Show that x = 2√(hy) and explain why the low and high holes land together.']},
    {'code': '', 'name': 'Water Tower', 'sim': 'fluids', 'select': 'Water Tower', 'tasks': [
        'Fill the tank, open the hole and turn on <b>Show h</b>. Predict the exit speed with v = √(2gh), then check it.',
        'Use the speed and the height of the hole to predict where the stream lands. Check with the measuring tape.',
        'Raise the whole tower. Does the exit speed change? Does the landing spot?',
        'Set the faucet to <b>match leakage</b>. What does that tell you about the flow rate in and out?']},
    {'code': 'IB', 'name': 'Terminal Velocity', 'sim': 'stokes', 'gapBefore': True, 'tasks': [
        'Draw the free-body diagram of a sphere falling at terminal velocity in glycerin. Derive v<sub>t</sub> = 2r²(ρ<sub>s</sub> − ρ<sub>f</sub>)g/(9η).',
        'Double the radius. By what factor does v<sub>t</sub> change? Explain with how weight and drag depend on r.',
        'Plan a lab to measure η from v<sub>t</sub> for several radii. What should you graph to get a straight line?'],
     'note': 'IB A.2 only. AP Physics 1 does not include Stokes’ law.'},
    {'code': 'IB', 'name': 'Viscosity', 'sim': 'fluids', 'select': 'Viscosity', 'tasks': [
        'Drop a ball and watch its speed level off. Why does it stop speeding up?',
        'Record the terminal speed for several radii. Graph v<sub>t</sub> against r². What should the graph look like?',
        'Use the slope of your graph to find the viscosity η. Check it against the sim.'],
     'note': 'IB A.2 only. AP Physics 1 does not include viscosity.'},
]},
# ------------------------------------------------------------------ AP PHYSICS 2 / IB
'P2-01': {'course': 'AP Physics 2 / IB', 'num': '01', 'title': 'Thermodynamics', 'tabs': [
    {'code': 'IB', 'name': 'Black Bodies', 'sim': 'green', 'select': 'Black Bodies', 'tasks': [
        'Raise the temperature. Which way does the peak move? Check that λ<sub>max</sub>·T stays about 2.9 × 10⁻³ m·K.',
        'Double the temperature. By what factor does the power per square meter go up? Explain with σT⁴.',
        'Compare the Sun (about 5800 K) with the Earth (about 290 K). Which part of the spectrum does each one mostly give off?',
        'A stove burner glows red, but your body doesn’t glow. Both are black bodies. What’s different?']},
    {'code': 'IB', 'name': 'Sunlight & Albedo', 'sim': 'green', 'select': 'Sunlight & Albedo', 'tasks': [
        'Change the distance from the Sun. Mars is about 1.5 times farther than Earth. Predict its solar constant with the inverse-square law, then check it.',
        'Why is the average sunlight on the whole Earth only S/4, not S?',
        'Turn the clouds and the ice &amp; snow on and off. Which one changes Earth’s albedo more?',
        'Switch between June and December. Why does the albedo of the whole Earth change during the year?']},
    {'code': 'IB', 'name': 'Energy Balance', 'sim': 'green', 'select': 'Energy Balance', 'tasks': [
        'Pick <b>Earth, no greenhouse</b>. Find the equilibrium temperature and compare it with the real average of about 288 K.',
        'Raise the albedo. Predict the new temperature, then check it.',
        'Try Venus, Mars and the Moon. Which one ends up far hotter than a no-greenhouse planet at its distance? Why?',
        'Use <b>Start cold</b> and <b>Start hot</b>. Why does the planet end up at the same temperature either way?']},
    {'code': 'IB', 'name': 'Atmosphere', 'sim': 'green', 'select': 'Atmosphere', 'tasks': [
        'Turn on the one-layer atmosphere. How much warmer is the surface than with no atmosphere?',
        'Change the emissivity of the atmosphere. Predict the surface temperature, then check it.',
        'Open <b>IB-style practice</b>. Solve a problem on paper before you press Check.',
        'Add CO₂. Explain the <b>enhanced</b> greenhouse effect in two sentences.']},
    {'code': 'IB', 'name': 'Molecules & IR', 'sim': 'green', 'select': 'Molecules & IR', 'tasks': [
        'Shine infrared on N₂, O₂, CO₂ and H₂O. Which molecules absorb it?',
        'Match the photon energy to the gap between energy levels. What happens when they don’t match?',
        'N₂ and O₂ make up 99 % of the air. Why don’t they trap infrared?',
        'Name a natural and a human source for each greenhouse gas.']},
]},
'P2-02': {'course': 'AP Physics 2 / IB', 'num': '02', 'title': 'Electrostatics', 'tabs': [
    {'code': '', 'name': 'Charging & the Electroscope', 'sim': 'scope', 'tasks': [
        'Bring a charged rod near the electroscope without touching. Why do the leaves spread if no charge moved onto it?',
        'Charge the electroscope by <b>conduction</b> (touching). What sign does it end up with? Same as the rod or opposite?',
        'Charge it by <b>induction</b>: rod near, ground it, remove the ground, then the rod. What sign does it end up with?',
        'In induction, why does the order matter? What happens if you take the rod away before the ground?']},
    {'code': '', 'name': 'Electric Field Hockey', 'sim': 'hockey', 'tasks': [
        'Turn on <b>Field</b>. Place one positive charge. Predict the puck’s path, then press Start.',
        'Use as few charges as you can to get the puck into the goal on Practice.',
        'Turn on <b>Trace</b>. Is the puck’s path the same as a field line? Why not?',
        'Make the puck negative. What changes about every force on it?']},
]},
'P2-05': {'course': 'AP Physics 2 / IB', 'num': '05', 'title': 'Modern Physics', 'tabs': [
    {'code': '', 'name': 'Nuclear Fission', 'sim': 'fission', 'tasks': [
        '<b>One nucleus:</b> fire a neutron at U-235. Count the neutrons that come out. Where does the energy come from?',
        '<b>Chain reaction:</b> mix U-235 and U-238. What percent of U-235 do you need for a chain reaction to keep going?',
        'Put the fuel in the containment vessel. Why does a smaller lump of fuel lose more neutrons?',
        '<b>Reactor:</b> move the control rods. What do they absorb? How do they keep the power steady?']},
    {'code': 'IB', 'name': 'Star Life Cycle', 'sim': 'star', 'gapBefore': True, 'tasks': [
        'Follow the Sun through its life. At each stage, which wins: gravity inward or pressure outward?',
        'Compare a 1 solar-mass star with a 15 solar-mass star. Which lives longer? Check with t ∝ M<sup>−2.5</sup>.',
        'Watch the H-R diagram. Where does a star go when it becomes a red giant? Use L = 4πR²σT⁴ to explain why it moves there.',
        'Which stars end as white dwarfs, neutron stars and black holes? Why can’t fusion go past iron?'],
     'note': 'IB E.5 Stellar evolution.'},
]},
}

# ------------------------------------------------------------------ extra sims
SIMS['plates'] = {'file': 'pt/out.html', 'kind': 'xl', 'ar': '1008 / 676',
                  'credit': 'Crust and Plate Motion are an HTML5 port of PhET “Plate Tectonics”. ' + PHET + ' Other tabs are original; plate boundaries from Bird (2003), earthquake and volcano data from USGS and Smithsonian GVP.'}

AB = 'Algebra-Based Physics'
UNITS.update({
'AB-01': {'course': AB, 'num': '01', 'title': 'Kinematics', 'tabs': [
    {'code': '', 'name': 'Moving Man', 'sim': 'mman', 'tasks': [
        'Make the man walk to the right at a steady 2 m/s. What does the position–time graph look like?',
        'Now make him walk to the left at the same speed. What changed on the graph? What stayed the same?',
        'Start him at rest and speed him up. How is the position–time graph different from a steady walk?',
        'Read his velocity from the velocity–time graph at two times. Use a = Δv/Δt to find his acceleration.']},
    {'code': '', 'name': 'Maze Game', 'sim': 'maze', 'tasks': [
        'Play with <b>position</b> control. Then switch to <b>velocity</b>. What does dragging the arrow control now?',
        'Try <b>acceleration</b> control. Why is it so hard to stop on the goal?',
        'With velocity control, how do you make the ball stop? With acceleration control?']},
]},
'AB-02': {'course': AB, 'num': '02', 'title': 'Newton’s Laws', 'tabs': [
    {'code': '', 'name': 'Push the Cart', 'sim': 'cart', 'tasks': [
        'Set both μ to 0 and push with 12 N. Predict the acceleration of a 2.0 kg cart with a = F/m, then run it.',
        'Double the mass but keep the force the same. What happens to the acceleration?',
        'Turn friction back on. Find the smallest push that gets a 4.0 kg cart moving when μ<sub>s</sub> = 0.30. Use F<sub>f</sub> = μF<sub>N</sub> to check.',
        'While the cart is moving, set the push equal to the friction. What does the cart do? Which of Newton’s laws explains it?']},
    {'code': '', 'name': 'Lunar Lander', 'sim': 'lander', 'tasks': [
        'Find the thrust that makes the lander hover. How does it compare with the lander’s weight?',
        'Turn on the force vectors. When the lander is slowing down on the way down, which force is bigger?',
        'Land at under 2 m/s. Describe your plan using “net force up” and “net force down.”']},
]},
'AB-03': {'course': AB, 'num': '03', 'title': 'Circular Motion & Gravity', 'tabs': [
    {'code': '', 'name': 'Kepler’s 1st Law', 'sim': 'kepler', 'tasks': [
        'Draw ellipse #1. Remove the pins, draw the line through the foci, and measure the distance between the foci (<i>d</i>) and the major axis (<i>L</i>).',
        'Find the eccentricity: <i>e</i> = <i>d</i> ÷ <i>L</i>. Repeat for ellipses #2, #3 and #4.',
        'Which ellipse is closest to a circle? What happens to <i>e</i> as the pins move farther apart?',
        'In Free play, put both pins in the same hole. What shape do you get, and what is <i>e</i>?',
        'Earth’s orbit has <i>e</i> ≈ 0.02. Which of your ellipses does it look most like?']},
    {'code': '', 'name': 'My Solar System', 'sim': 'solar', 'tasks': [
        'Pick the <b>sun and planet</b> preset and turn on Show Traces. Is the orbit a circle?',
        'Give the planet a little less speed. Where on its orbit does it move fastest?',
        'Make the sun heavier. Does the planet need more or less speed to keep the same orbit? Why?',
        'What would happen to the planet if the sun’s gravity suddenly turned off? Predict, then think about which way it would go.']},
]},
'AB-04': {'course': AB, 'num': '04', 'title': 'Work & Energy & Stars', 'tabs': [
    {'code': '', 'name': 'Star Life Cycle', 'sim': 'star', 'tasks': [
        'Follow the Sun through its life. At each stage, which is winning: gravity pulling in or pressure pushing out?',
        'Where does a star’s energy come from? Watch the core during the main sequence.',
        'Compare a small star with a very big star. Which one lives longer? Is that what you expected?',
        'Which stars end as white dwarfs, and which explode as supernovas?']},
]},
'AB-05': {'course': AB, 'num': '05', 'title': 'Momentum', 'tabs': []},
'AB-06': {'course': AB, 'num': '06', 'title': 'Electrostatics', 'tabs': [
    {'code': '', 'name': 'Charging & the Electroscope', 'sim': 'scope', 'tasks': [
        'Bring a charged rod near the electroscope without touching it. Why do the leaves spread apart?',
        'Touch the rod to the electroscope. What sign of charge does the electroscope get?',
        'Charge it without touching: rod near, touch with your hand, remove your hand, then the rod. What sign does it get?',
        'Why do the leaves push apart instead of pulling together?']},
    {'code': '', 'name': 'Electric Field Hockey', 'sim': 'hockey', 'tasks': [
        'Place one positive charge near the puck. Does the puck move toward it or away? Why?',
        'Use as few charges as you can to score on Practice.',
        'Make the puck negative. What changes?']},
]},
'AB-07': {'course': AB, 'num': '07', 'title': 'Current Electricity & Magnetism', 'tabs': []},
'AB-08': {'course': AB, 'num': '08', 'title': 'Waves & Earth’s Interior', 'tabs': [
    {'code': '', 'name': 'Earth’s Interior', 'sim': 'plates', 'select': "Earth's Interior", 'tasks': [
        'Name the layers from the surface to the center. Which layers are solid and which are liquid?',
        'How do scientists know what is inside the Earth when nobody has drilled through the crust?',
        'Where is the Earth hottest? Why doesn’t the inner core melt?']},
    {'code': '', 'name': 'Seismic Waves', 'sim': 'plates', 'select': 'Seismic Waves', 'tasks': [
        'Drag the earthquake to a new spot and watch the waves. Which arrive first, P or S? Which kind of wave is each one (push–pull or side to side)?',
        'Find the shadow zone where S-waves never arrive. What does that tell us about the outer core?',
        'Use the time between the P-wave and the S-wave to explain how far away an earthquake was.']},
    {'code': '', 'name': 'Crust', 'sim': 'plates', 'select': 'Crust', 'tasks': [
        'Compare ocean crust and continental crust. Which is thicker? Which is denser?',
        'Change the temperature and composition. Which crust floats higher on the mantle?']},
    {'code': '', 'name': 'Plate Motion', 'sim': 'plates', 'select': 'Plate Motion', 'tasks': [
        'Push two plates together. What forms when ocean crust meets continental crust?',
        'Pull two plates apart. What happens in the gap?',
        'Slide two plates past each other. What do we feel at this kind of boundary?']},
    {'code': '', 'name': 'Plate Map', 'sim': 'plates', 'select': 'Plate Map', 'tasks': [
        'Turn on earthquakes and volcanoes. Where do most of them happen?',
        'Find a place where two plates are moving apart and one where they are moving together.']},
    {'code': '', 'name': 'Magnetic Stripes', 'sim': 'plates', 'select': 'Magnetic Stripes', 'tasks': [
        'Watch new sea floor form at the ridge. Why do the stripes match on both sides?',
        'Use the stripe widths to estimate how fast the plates are moving apart.']},
    {'code': '', 'name': 'Consequences', 'sim': 'plates', 'select': 'Consequences', 'tasks': [
        '<b>Hot spot islands:</b> run it. Why does the newest volcano always sit over the hot spot while older ones get carried away?',
        'Turn on volcano ages. Use the distance and age of two volcanoes to find how fast the plate moves.',
        '<b>Earthquakes on a fault:</b> what builds up before each earthquake, and what happens when it lets go?',
        'Why does Japan have so many earthquakes but Maryland very few? Use the Plate Map to explain.']},
]},
# AP units that don't have sims yet
'P1-01': {'course': 'AP Physics 1 / IB', 'num': '01', 'title': 'Newton’s First Law', 'tabs': [
    {'code': '', 'name': 'Puck in Space', 'sim': 'puck', 'tasks': [
        '<b>Predict, then check.</b> A puck slides at 3 m/s with no friction. What is it doing 5 s later? 50 s later? What would it take to change that?',
        'Look at the dots. How can you tell from the spacing alone that no net force acts between kicks?',
        'Use <b>Stop it dead</b>. After the kick, does the puck slowly start moving again? Explain with Newton’s 1st law.',
        '<b>Reverse it.</b> Sketch the v–t and x–t graphs before you run it. Where on each graph does the kick show up?',
        '<b>Kick sideways.</b> A spaceship coasting → fires its engine ↑ for a moment. A student says it now moves straight ↑. Use the velocity diagram to explain the real path, then find its speed and direction.']},
    {'code': '', 'name': 'Balanced Forces', 'sim': 'balance', 'tasks': [
        '<b>Claim.</b> “To keep a crate moving at a constant speed, your push must be bigger than friction.” Find the push that keeps a 20 kg crate (μ<sub>k</sub> = 0.30) at a steady speed. Was the claim right?',
        'Push harder than friction, then less than friction. Describe the v–t graph each time. Is the crate still moving forward while you push less than friction?',
        '<b>Let go.</b> What stops the crate? Make μ smaller and smaller. What happens at μ = 0?',
        '<b>Skydiver.</b> Draw the free-body diagram right after jumping, halfway, and at terminal speed. When is ΣF = 0, and what is the skydiver doing then?',
        'Open the chute. The skydiver is still falling, but which way does ΣF point? Explain with the D and W arrows.']},
    {'code': '', 'name': 'Inertia on a Cart', 'sim': 'cartball', 'tasks': [
        '<b>Predict, then check.</b> A cart rolling at 4 m/s launches a ball straight up. Does the ball land in front of, behind, or back in the launcher?',
        'Explain using Newton’s 1st law: what horizontal force acts on the ball while it’s in the air?',
        'Switch to “Watch from: The cart.” Describe the ball’s path from there. Which view is “right”?',
        'Make the cart speed up while the ball is in the air. Where does the ball land now, and why didn’t the ball “change”?',
        '<b>Real life:</b> you toss your keys straight up on a bus moving at a steady 20 m/s. Where do they land? What if the bus brakes?']},
    {'code': '', 'name': 'When Do They Meet?', 'sim': 'meet', 'tasks': [
        '<b>Head-on.</b> Two cars start 200 m apart and drive toward each other at 15 m/s and 10 m/s. Write x(t) for each, solve for when and where they meet, then check.',
        'Show that t = d/(v<sub>A</sub> + v<sub>B</sub>) by thinking about how fast the gap closes.',
        '<b>Catch-up.</b> A police car at 25 m/s chases a car 100 m ahead going 15 m/s. When does it catch up? Read the answer off the x–t graph too.',
        'Set both speeds equal in Catch-up. What do the lines on the x–t graph look like, and what does that mean?',
        '<b>Late start.</b> Car A leaves at 10 m/s; car B leaves the same spot 5 s later at 15 m/s. Where does B pass A? Explain why B’s line starts flat.']},
    {'code': '', 'name': 'Springs', 'sim': 'springs', 'tasks': [
        '<b>Hooke’s law.</b> Hang 100 g, then 200 g, then 300 g from one spring. Record the stretch each time. What pattern do you see?',
        'Graph x vs m. Use the slope to find k, then compare with the k slider.',
        'Which spring stretches more with the same mass: k = 20 N/m or k = 40 N/m? Explain what k means in words.',
        '<b>Equilibrium.</b> Draw the free-body diagram of the hanging mass. Why is the spring force equal to mg?',
        '<b>Series and parallel.</b> Hang the same mass from two equal springs side by side, then one below the other. Predict the stretch each time before you check.']},
]},
'P1-03': {'course': 'AP Physics 1 / IB', 'num': '03', 'title': 'Newton’s Third Law', 'tabs': [
    {'code': '', 'name': 'Push Two Blocks', 'sim': 'blocks', 'tasks': [
        '<b>Classic FRQ.</b> A 30 N push acts on a 4 kg block that pushes a 2 kg block (frictionless). Find a, then the force between the blocks. Check with the sim.',
        'Now push from the other side with the same force. Does a change? Does the contact force? Explain why.',
        'Use the free-body diagrams to name the Newton’s third-law pair between the blocks. Are they equal even though the masses differ?',
        '<b>Add friction.</b> Show that the contact force is still F × m<sub>far</sub>/(m<sub>1</sub> + m<sub>2</sub>): the friction cancels out.',
        '<b>Train of carts.</b> Which rope has the biggest tension? Find T<sub>12</sub> and T<sub>23</sub> by choosing the right system for each.']},
    {'code': '', 'name': 'Pulleys', 'sim': 'pulleys', 'tasks': [
        '<b>Atwood machine.</b> m<sub>1</sub> = 2.0 kg, m<sub>2</sub> = 1.5 kg. Find a and T on paper, then check. Is T bigger or smaller than each weight?',
        'Make the masses equal. What are a and T? Then make one mass much bigger. What does a approach?',
        '<b>Table + hanging mass.</b> Find the smallest hanging mass that gets the block moving with μ<sub>k</sub> = 0.2.',
        'Use the Newton’s third-law pairs. Which force pairs with the string pulling up on m<sub>1</sub>? Which pairs with the Earth pulling down on it?',
        '<b>Block and tackle.</b> Draw the free-body diagram of the moving pulley and load with 4 segments. How hard must you pull to hold 60 kg? Check with the FBD in the sim.',
        'With n segments, how much force does the ceiling hold? Draw the FBD of the top pulleys and explain why it is more than the load’s weight.']},
    {'code': '', 'name': 'Box on a Truck', 'sim': 'truck', 'tasks': [
        '<b>Predict, then check.</b> A truck carrying a box drives at a constant 20 m/s. Which way does friction on the box point? Explain with Newton’s 1st law, then check “Constant speed.”',
        'Speeding up at 2 m/s²: draw the box’s free-body diagram. What force makes the box speed up? Why is it <i>not</i> equal to μ<sub>s</sub>N?',
        'Find the largest acceleration the truck can have without the box slipping. Show that it is μ<sub>s</sub>g and that it doesn’t depend on the box’s mass. Check by changing m.',
        '<b>Floor it.</b> Now the box slides. Is it still speeding up in the ground’s frame? Find a<sub>box</sub> and the time it takes to reach the tailgate.',
        '<b>System.</b> When the box doesn’t slip, find the road force with (M + m)a. Why does that shortcut fail once the box slides? Find the road force a different way.',
        '<b>Braking.</b> Which way does friction on the box point now? Which way does the box push on the truck bed? Name the third-law pair.']},
]},
'P1-08': {'course': 'AP Physics 1 / IB', 'num': '08', 'title': 'Rotation', 'tabs': [
    {'code': '', 'name': 'Spinning Wheel', 'sim': 'spin', 'tasks': [
        '<b>Same equations, new letters.</b> A wheel starts at 2 rad/s and speeds up at 3 rad/s² for 4 s. Find ω and the number of revolutions, then check.',
        'Use “Turns around.” Sketch the ω–t graph and explain what the area means when part of it is below the axis.',
        '<b>Ceiling fan.</b> A fan at 180 rpm coasts to a stop in 15 s. Convert to rad/s, then find α and how many turns it makes.',
        'Two dots on the same wheel, one at the rim and one halfway out. Compare their ω, α, v and a<sub>c</sub>.',
        'Why do we use radians and not degrees in v = rω?']},
    {'code': '', 'name': 'Torque', 'sim': 'torque', 'tasks': [
        '<b>Wrench.</b> Graph τ vs θ. At which angles is the torque zero, and which is biggest? Show where the lever arm r<sub>⊥</sub> is on the drawing.',
        '<b>Seesaw.</b> A 30 kg kid sits 1.5 m from the pivot. Where must a 45 kg kid sit to balance? Solve, then check. What force does the pivot exert?',
        '<b>Plank.</b> A 60 kg person walks out on a 40 kg plank. Find both support forces when the person is at 2 m. Which support carries more?',
        'How far out can the person walk before the plank tips? Explain why N<sub>A</sub> = 0 at that moment and where you put the pivot to solve it.',
        '<b>Beam and cable.</b> Find the cable tension for θ = 30°, then explain why a flatter cable needs much more tension. Find both parts of the hinge force.']},
    {'code': '', 'name': 'Rotational Inertia', 'sim': 'inertia', 'tasks': [
        '<b>Predict, then check.</b> Move both beads from 0.3 m to 0.6 m. By what factor does their part of I change? Use the ×2 line.',
        'With the same torque, which spins up faster: beads in close or at the ends? Explain using τ = Iα.',
        '<b>Shapes.</b> Rank the hoop, disk, hollow sphere and solid sphere by I (same M and R). Explain the ranking by where the mass is.',
        'Why is a rod’s I about one end 4 times its I about the center?']},
    {'code': '', 'name': 'Massive Pulley', 'sim': 'mpulley', 'tasks': [
        '<b>Spool.</b> A 1 kg mass hangs from a string wrapped on a 2 kg disk pulley. Find a and T. Why is T less than mg?',
        'Change the pulley radius. Does a change? Does α? Explain using I = ½MR² and a = Rα.',
        '<b>Atwood.</b> Show that the tensions on the two sides are different. Which is bigger, and what does the difference do?',
        '<b>Classic FRQ (table).</b> Derive a = m<sub>2</sub>g/(m<sub>1</sub> + m<sub>2</sub> + ½M), then check with the sim. What happens as M → 0?',
        'Switch the pulley from a disk to a hoop of the same mass. Predict whether a goes up or down.']},
    {'code': '', 'name': 'Rolling Race', 'sim': 'roll', 'tasks': [
        '<b>Predict, then check.</b> A solid ball, a disk, a hollow ball and a hoop race down the same ramp. Rank them before you run it.',
        'Show that v = √(2gh/(1 + k)) for something rolling without slipping. Why don’t M and R appear?',
        'What fraction of a hoop’s kinetic energy is spinning energy at the bottom? A solid ball’s?',
        'Why does friction let the ball roll but not take away mechanical energy?',
        '<b>Roll up a hill.</b> Each object rolls at 4 m/s at the bottom. Which goes highest, and why does the hoop beat the sliding block?']},
    {'code': '', 'name': 'Angular Momentum', 'sim': 'angmom', 'tasks': [
        '<b>Spinning stool.</b> A student spins at 2 rad/s holding dumbbells out, then pulls them in. Find the new ω with I<sub>1</sub>ω<sub>1</sub> = I<sub>2</sub>ω<sub>2</sub>.',
        'Is kinetic energy conserved when the arms come in? Where does the extra energy come from?',
        '<b>Merry-go-round.</b> A 40 kg kid running at 4 m/s jumps on the edge of a 150 kg, 2 m merry-go-round. Find ω. Why isn’t linear momentum conserved here?',
        '<b>Door.</b> Clay hits a door at 0.8 m from the hinge and sticks. Find ω. Then hit near the hinge: why does the door barely move?',
        'In all three, explain why there is no outside torque.']},
]},
'P1-10': {'course': 'AP Physics 1 / IB', 'num': '10', 'title': 'Simple Harmonic Motion', 'tabs': [
    {'code': '', 'name': 'Mass on a Spring', 'sim': 'shm', 'tasks': [
        '<b>Predict, then check.</b> What happens to the period if you double the amplitude? If you make the mass 4× bigger? Use the ×2 line.',
        'Where in the motion is the speed biggest? The acceleration? The force? Use the x, v and a graphs to justify each answer.',
        'A 1.0 kg block on a 40 N/m spring is pulled 0.15 m and released. Find T, v<sub>max</sub> and a<sub>max</sub>, then check.',
        'Use the energy bars: show that ½kA² = ½mv<sub>max</sub>². Where is the energy all kinetic? All spring energy?',
        '<b>Vertical.</b> Why is the period the same as horizontal? What does gravity change?',
        '<b>Weighing in space.</b> How can astronauts measure their mass on the ISS without weight? Find a 75 kg astronaut’s period, then work backward.']},
    {'code': '', 'name': 'Pendulum', 'sim': 'pend', 'tasks': [
        'Find the period of a 1.0 m pendulum. Then change the mass. Explain why the mass doesn’t matter.',
        'How long must a pendulum be to have a period of 2.0 s? Solve, then check.',
        '<b>Moon.</b> Predict the period of the same pendulum on the Moon (g = 1.6 m/s²), then check.',
        '<b>Elevator.</b> Does a pendulum clock run fast or slow in an elevator accelerating upward? Explain using an effective g.',
        'Release from 70°. How far off is the small-angle formula? Use the graph of period vs release angle.',
        'Find the speed and the string tension at the bottom for a 0.5 kg bob released from 30°. Why is the tension more than mg there?',
        '<b>Lab.</b> Explain why graphing T² against L gives a straight line, and how to get g from its slope.']},
    {'code': '', 'name': 'SHM & the Circle', 'sim': 'circle', 'tasks': [
        'Watch the shadow of the point going around the circle. Why does the shadow move fastest in the middle and stop at the ends?',
        'Write x(t) for each starting position. Which one is A cos(ωt)? A sin(ωt)?',
        'From the graphs, when x is at +A, what are v and a? When x = 0?',
        '<b>IB.</b> Show that a = −ω²x for the numbers on screen. What does the a–x graph look like, and what is its slope?',
        '<b>IB HL.</b> Use v = ±ω√(A² − x²) to find the speed when x = A/2.']},
    {'code': '', 'name': 'Clay on a Block', 'sim': 'clay', 'tasks': [
        '<b>Classic FRQ.</b> Clay drops onto a block as it passes equilibrium and sticks. Predict whether the period, amplitude, maximum speed and energy go up, down or stay the same. Then check.',
        'Now drop the clay at the end of the swing. Which of your predictions change, and why?',
        'Show that A<sub>2</sub> = A√(M/(M + m)) when the clay lands at equilibrium. Which conservation law do you use for the collision, and which for after?',
        'Why is no energy lost when the clay lands at the end?']},
    {'code': 'IB', 'name': 'Damping & Resonance', 'sim': 'reson', 'gapBefore': True, 'tasks': [
        'Compare light, critical and heavy damping. Which returns to equilibrium fastest without overshooting? Why do car shock absorbers use it?',
        'With light damping, how many oscillations until the amplitude halves? What happens to the energy?',
        '<b>Resonance.</b> Sweep the driving frequency. Where is the amplitude biggest? What happens to the peak when you add damping?',
        'Explain why London’s Millennium Bridge swayed, and how tuned mass dampers like Taipei 101’s stop buildings from doing the same.'],
     'note': 'IB C.4 only. AP Physics 1 does not include damping or resonance.'},
]},
'P2-03': {'course': 'AP Physics 2 / IB', 'num': '03', 'title': 'Current Electricity and Magnetism', 'tabs': []},
'P2-04': {'course': 'AP Physics 2 / IB', 'num': '04', 'title': 'Waves & Optics', 'tabs': []},
})
for k in ('AB-05', 'AB-07'):
    UNITS[k]['note'] = 'Check back soon.'
