A NOT gate inverts its input, outputting 1 for 0 and 0 for 1.

It is the simplest logic gate and often called an inverter. If you think of a light controlled by a switch, the NOT gate is the switch that is on when the handle is down. Inverters are everywhere: they turn a signal into its opposite and are essential for building NAND, NOR, and more complex circuits.

$$
Y = \overline{A}
$$

| A | Y |
|---|---|
| 0 | 1 |
| 1 | 0 |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`. The testbench checks both possible input values against the inversion function.
