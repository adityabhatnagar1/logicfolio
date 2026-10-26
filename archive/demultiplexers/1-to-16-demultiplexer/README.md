A 1:16 demultiplexer sends one data input to one of sixteen outputs, chosen by four select lines.

The top bit, S3, decides whether the input goes to the lower 1:8 demultiplexer or the upper one, and the other half sees a 0. The three low bits then pick the exact output inside the chosen half. It is the same step as every smaller size, applied once more.

$$ I_{lo} = \overline{S_3}\,I, \qquad I_{hi} = S_3\,I $$

$$ Y_k = I_{lo}\cdot[\,k = S_2 S_1 S_0\,] \;\; (k = 0 \ldots 7), \qquad Y_{k+8} = I_{hi}\cdot[\,k = S_2 S_1 S_0\,] $$

The cascade keeps the load on every node small, because each 1:2 stage drives only two inputs and regenerates the signal before passing it on. A flat decoder instead reaches any output in a single gate level, but then the data input and each select line must drive many gates at once, which loads the source and usually needs buffering. The tree trades one gate delay per stage for light, even loading, and reuses one small tested cell throughout.

Simulate with `iverilog -o sim tb.v design.v demux_1to8.v demux_1to4.v demux_1to2.v && vvp sim`. The testbench sweeps all 32 combinations of select and data bits.
