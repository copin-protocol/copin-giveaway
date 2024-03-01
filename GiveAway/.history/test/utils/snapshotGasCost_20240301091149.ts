const { BigNumber } = require("@ethersproject/bignumber");
// import { expect } from "./expect";

async function snapshotGasCost(x: any) {
  const resolved = await x;
  if ("deployTransaction" in resolved) {
    const receipt = await resolved.deployTransaction.wait();
    expect(receipt.gasUsed.toNumber()).toMatchSnapshot();
  } else if ("wait" in resolved) {
    const waited = await resolved.wait();
    expect(waited.gasUsed.toNumber()).toMatchSnapshot();
  } else if (BigNumber(resolved)) {
    expect(resolved.toNumber()).toMatchSnapshot();
  }
}

export default snapshotGasCost;
