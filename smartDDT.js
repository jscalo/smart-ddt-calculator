// calcTw - calculate required water temp based on inputs. all temps are celsius. use 0 for Ts if not including starter.
function calcTw(
	Mc, // mass of flour
	Mw, // mass of water
	Ms, // mass of starter
	Ta, // temp of environment (cels)
	Tc, // temp of flour (cels)
	Ts, // temp of starter (cels)
	Tt, // target temperature (cels)
	useMixer // bool for is using a mixer nor not
) {
    Cf = 1.8 // appx specific heat of flour
    Cs = 2.97 // appx s.h. of starter
    
    Td = Ta - Tt // temperature delta
    mass = Mc + Mw + Ms

    // Estimate time in minutes to homogenous mixture
    t = estimateT(mass, Ms > 0, useMixer)
    
    // Determine best tau value based on regression analysis
    tau = 0
    if (useMixer) {
        if (Td > 0) {
            // mixer, cold water
            tau = 0.0097 * mass - 0.59
        } else {
            // mixer, hot water
            tau = -0.0364 * mass + 100.8
        }
    } else {
        if (Td > 0) {
            // hands, cold water
            tau = 0.018 * mass - 7.83
        } else {
            // hands, hot water
            tau = 0.0069 * mass + 16.41
        }
    }

    powexp = Math.pow(Math.E, t / tau) // e^(t/tau)
    
    // For convenience, throw this constant into r
    r = 0.239006

    // Calculate water required water temp
    Tw = (Cf * Mc * (-r * Ta * powexp + r * Tt * powexp - r * Tc + r * Ta) + Mw * (-Ta * powexp + Tt * powexp + Ta) + Cs * Ms * (-r * Ta * powexp + r * Tt * powexp + r * Ta - r * Ts)) / Mw

    //Determine best adjustment based on regression analysis. Accounts for inaccurate specific heat values, heat transfer to/from bowl, and other factors not captured by the general equation above.
    adj = 0

    if (useMixer) {
        if (Td > 0) {
            // mixer, cold water
            adj = -5.101624 + 0.000727 * mass - 0.121061 * Td
        } else {
            // mixer, hot water
            adj = 0.646376 - 0.002668 * mass - 0.0303 * Td
        }
    } else {
        if (Td > 0) {
            // hands, cold water
            adj = -2.735815 - 0.001988 * mass + 0.240984 * Td
        } else {
            // hands, hot water
            adj = -4.866337 - 0.000491 * mass - 0.389525 * Td
        }
    }

    return Tw + adj
}

// estimateT - estimate time in minutes of mixing required before mixture is thoroughly combined. this is somewhat arbitrary and should be adjusted as needed.
function estimateT(
	mass,
	useStarter,
	useMixer
) {
    // minutes of mixing
    t = 2

    // Perhaps counter intuitively, mixers are generally _less_ efficient than hands for smaller amounts of dough, so add a minute if mixing by mixer.
    if (useMixer && mass < 2000) {
        t += 1
    }

    // Add a minute if using starter since its stickiness requires longer to integrate.
    if (useStarter) {
        t += 1
    }

    // Add a minute for every additional 10kg
    if (mass > 10000) {
        t += Math.floor(mass / 10000)
    }

    return t
}
