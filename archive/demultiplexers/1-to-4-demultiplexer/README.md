A 1:4 demultiplexer sends one data input to one of four outputs, chosen by two select lines.

Picture a sorting office with one incoming belt and four outgoing bins. The first switch, steered by S1, sends the parcel to the left pair or the right pair. A second switch, steered by S0, then picks the exact bin. Each output ends up carrying the input only when the select lines spell out its own number.

$$ Y_0 = \overline{S_1}\,\overline{S_0}\,I, \quad Y_1 = \overline{S_1}\,S_0\,I, \quad Y_2 = S_1\,\overline{S_0}\,I, \quad Y_3 = S_1\,S_0\,I $$

| S1 | S0 | Selected output |
|----|----|-----------------|
| 0 | 0 | Y0 |
| 0 | 1 | Y1 |
| 1 | 0 | Y2 |
| 1 | 1 | Y3 |

Simulate with `iverilog -o sim tb.v design.v demux_1to2.v && vvp sim`. The testbench sweeps all 8 combinations of select and data bits.
