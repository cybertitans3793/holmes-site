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
    'solar':   {'file': 'single/my-solar-system.html', 'kind': 'plain', 'ar': '4 / 3', 'credit': 'My Solar System is a single-file copy of the open-source sim (old PhET-style constants). ' + PHET},
}

UNITS = {
# ------------------------------------------------------------------ AP PHYSICS 1
'P1-02': {'course': 'AP Physics 1', 'num': '02', 'title': 'Newton’s Second Law', 'tabs': [
    {'code': '02-2', 'name': 'Moving Man', 'sim': 'mman', 'tasks': [
        'Start the man at −4 m with a constant velocity of +2 m/s. Sketch the x–t and v–t graphs before you press play, then compare.',
        'From rest, give him an acceleration of +1 m/s². What shape is the x–t graph? What does the area under the v–t graph tell you?',
        'Make him slow down while he is still moving to the right. What signs do v and a have?',
        'Make the v–t graph a flat line at −1.5 m/s. Is he speeding up, slowing down, or neither?']},
    {'code': '02-3', 'name': 'Push the Cart', 'sim': 'cart', 'tasks': [
        'Set both μ to 0. Double the force. Predict what happens to <i>a</i>, then run it.',
        'Keep F = 12 N and double the mass. What happens to <i>a</i>?',
        'Find the smallest force that starts a 4.0 kg cart moving when μ<sub>s</sub> = 0.30. Once it is moving, what is the net force?',
        'While the cart is moving, lower F until it equals kinetic friction. What does the v–t graph do? Why doesn’t the cart stop?']},
    {'code': '02-5', 'name': 'Lunar Lander', 'sim': 'lander', 'tasks': [
        'Find the thrust that makes the lander hover. How does that thrust compare with the lander’s weight on the Moon?',
        'Can the lander move down at a steady speed with the engine on? What is the net force then?',
        'Turn on the force vectors. While the lander slows its fall, which way does the net force point?',
        'Land at under 2 m/s with as little fuel as you can. Describe your strategy using F<sub>net</sub> = ma.']},
]},
'P1-04': {'course': 'AP Physics 1', 'num': '04', 'title': 'Motion and Forces in 2D', 'tabs': [
    {'code': '', 'name': 'Maze Game', 'sim': 'maze', 'tasks': [
        'Steer the ball with <b>position</b> only. Easy? Now switch to <b>velocity</b>. What does the arrow you drag now control?',
        'Switch to <b>acceleration</b>. Why is it so much harder to stop at the goal?',
        'With acceleration control, how do you make the ball turn a corner at constant speed? Which way must the acceleration point?',
        'Watch the velocity and acceleration arrows. Can the ball move one way while it accelerates the other way? When?']},
]},
'P1-05': {'course': 'AP Physics 1', 'num': '05', 'title': 'Circular Motion and Gravity', 'tabs': [
    {'code': '', 'name': 'My Solar System', 'sim': 'solar', 'tasks': [
        'Choose the <b>sun and planet</b> preset and turn on Show Traces. Is the orbit a circle? Change the planet’s v<sub>y</sub> until it is as round as you can make it.',
        'Give the planet a bit less speed. Where on its orbit is it fastest? Where is it slowest?',
        'Double the sun’s mass. Does the planet need more or less speed for a circular orbit at the same distance? About how many times more?',
        'Try the <b>sun, planet, moon</b> preset. What keeps the moon going around the planet while the planet goes around the sun?']},
]},
'P1-09': {'course': 'AP Physics 1', 'num': '09', 'title': 'Fluids', 'tabs': [
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
    {'code': '', 'name': 'Buoyancy', 'sim': 'fluids', 'select': 'Buoyancy', 'tasks': [
        'Predict what fraction of a block with half the density of water floats under the surface. Then test it.',
        'Push a block all the way under, then deeper. Does the buoyant force keep growing?',
        'Compare two blocks: same size but different mass, then same mass but different size. Which pairs feel the same buoyant force?',
        '<b>Boat &amp; cargo:</b> predict how much cargo the boat can carry before it sinks, using its volume. Then load it.']},
    {'code': '', 'name': 'Scales', 'sim': 'fluids', 'select': 'Scales', 'tasks': [
        'Lower a hanging block into the water. By how much does the spring scale reading drop? Compare with the buoyant force.',
        'Watch the scale under the beaker at the same time. Where did the “missing” weight go? Use Newton’s third law.',
        'Tied mode: draw the free-body diagram of the block. Check the string tension against your diagram.',
        'Overflow can: compare the weight of the water that spills out with the buoyant force.']},
    {'code': '', 'name': 'Flow', 'sim': 'fluids', 'select': 'Flow', 'tasks': [
        'Squeeze one part of the pipe. Use the speed readouts to check A₁v₁ = A₂v₂.',
        'Put pressure gauges in the wide and narrow parts. Where is the pressure lower? Use the energy bars to explain.',
        'Raise one end of the pipe. How do the bars change between the low end and the high end?',
        'Venturi tubes: use the difference in water heights to find the speed in the narrow part.']},
    {'code': '', 'name': 'Water Tower', 'sim': 'fluids', 'select': 'Water Tower', 'tasks': [
        'Fill the tank, open the hole and turn on <b>Show h</b>. Predict the exit speed with v = √(2gh), then check it.',
        'Use the speed and the height of the hole to predict where the stream lands. Check with the measuring tape.',
        'Raise the whole tower. Does the exit speed change? Does the landing spot?',
        'Set the faucet to <b>match leakage</b>. What does that tell you about the flow rate in and out?']},
    {'code': 'IB', 'name': 'Viscosity', 'sim': 'fluids', 'select': 'Viscosity', 'gapBefore': True, 'tasks': [
        'Drop a ball and watch its speed level off. Why does it stop speeding up?',
        'Record the terminal speed for several radii. Graph v<sub>t</sub> against r². What should the graph look like?',
        'Use the slope of your graph to find the viscosity η. Check it against the sim.',
        'Watch the Reynolds number. When does Stokes’ law (F = 6πηrv) stop being a good model?'],
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
