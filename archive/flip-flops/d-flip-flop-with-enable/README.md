A D flip-flop with enable only takes in new data on a clock edge when enable is high; otherwise it keeps what it already holds.

Imagine a notepad that only gets rewritten when a "write" light is on. The clock keeps ticking the whole time, but unless the light is lit, each tick changes nothing. This is how registers hold a value for many cycles without the data input having to stay put.

$$ Q^{+} = en \cdot D + \overline{en} \cdot Q \quad \text{on the rising edge of } clk $$

| en | D | Q next |
|----|---|--------|
| 0  | x | Q      |
| 1  | 0 | 0      |
| 1  | 1 | 1      |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`. The testbench sweeps the stored value, en and D.
