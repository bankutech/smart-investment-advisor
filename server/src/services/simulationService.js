export class SimulationService {
  /**
   * Compound Wealth / SIP Growth Simulation
   * FV = P*(1+r)^t + PMT * [ ((1+r/12)^(12t) - 1) / (r/12) ]
   */
  simulateCompoundGrowth(initialPrincipal, monthlySip, years, baseCagrPct) {
    const P = parseFloat(initialPrincipal) || 10000;
    const PMT = parseFloat(monthlySip) || 500;
    const t = parseInt(years) || 10;
    const rBase = (parseFloat(baseCagrPct) || 12.0) / 100;

    const rOptimistic = rBase + 0.03;
    const rConservative = Math.max(0.04, rBase - 0.03);

    const timeline = [];

    for (let yr = 1; yr <= t; yr++) {
      const calcFv = (r) => {
        const months = yr * 12;
        const monthlyRate = r / 12;
        const compoundPrincipal = P * Math.pow(1 + monthlyRate, months);
        const compoundSip = monthlyRate > 0 
          ? PMT * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
          : PMT * months;
        return Math.round(compoundPrincipal + compoundSip);
      };

      const totalInvested = Math.round(P + (PMT * yr * 12));
      const expectedFv = calcFv(rBase);
      const optimisticFv = calcFv(rOptimistic);
      const conservativeFv = calcFv(rConservative);

      timeline.push({
        year: yr,
        totalInvested,
        expectedFv,
        optimisticFv,
        conservativeFv,
        expectedReturns: expectedFv - totalInvested
      });
    }

    const final = timeline[timeline.length - 1];

    return {
      inputs: { initialPrincipal: P, monthlySip: PMT, years: t, baseCagrPct },
      summary: {
        totalInvested: final.totalInvested,
        expectedWealth: final.expectedFv,
        expectedGains: final.expectedReturns,
        wealthMultiplier: (final.expectedFv / Math.max(1, final.totalInvested)).toFixed(2)
      },
      finalSummary: {
        totalInvested: final.totalInvested,
        expectedWealth: final.expectedFv,
        expectedGains: final.expectedReturns,
        wealthMultiplier: (final.expectedFv / Math.max(1, final.totalInvested)).toFixed(2)
      },
      timeline
    };
  }
}

export const simulationService = new SimulationService();
