A 1:8 demultiplexer sends one data input to one of eight outputs, chosen by three select lines.

The most significant select bit, S2, acts as a gate on the input. It hands the signal to either the lower 1:4 demultiplexer or the upper one, and the other half receives a 0 so all of its outputs stay low. The two low bits, S1 and S0, then pick the exact output inside the chosen half. So S2 splits the eight outputs cleanly into Y0 to Y3 and Y4 to Y7.

$$ I_{lo} = \overline{S_2}\,I, \qquad I_{hi} = S_2\,I $$

$$ Y_k = I_{lo}\cdot[\,k = S_1 S_0\,] \;\; (k = 0 \ldots 3), \qquad Y_{k+4} = I_{hi}\cdot[\,k = S_1 S_0\,] $$

Simulate with `iverilog -o sim tb.v design.v demux_1to4.v demux_1to2.v && vvp sim`. The testbench sweeps all 16 combinations of select and data bits.
