A 4:1 multiplexer uses two select lines to pass one of four data inputs through to the output.

Picture a small post office with four mail slots and a clerk who reads a two-digit code to decide which slot to open. Inside, it is just three 2:1 multiplexers: two in front, both steered by S0, and one at the end, steered by S1, which picks between their results.

$$ Y = \overline{S_1}\,\overline{S_0}\,I_0 + \overline{S_1}\,S_0\,I_1 + S_1\,\overline{S_0}\,I_2 + S_1\,S_0\,I_3 $$

| S1  | S0  | Y   |
| --- | --- | --- |
| 0   | 0   | I0  |
| 0   | 1   | I1  |
| 1   | 0   | I2  |
| 1   | 1   | I3  |

Simulate with `iverilog -o sim tb.v design.v mux_2to1.v && vvp sim`. The testbench sweeps all 64 combinations of select and data bits.
