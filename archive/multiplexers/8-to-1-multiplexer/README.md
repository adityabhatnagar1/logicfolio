An 8:1 multiplexer uses three select lines to pass one of eight data inputs through to the output.

Split the eight inputs into two groups of four. Each group goes into its own 4:1 multiplexer, steered by the two low select bits. The most significant bit, S2, then decides whether the final answer comes from the lower group or the upper group.

$$ Y_{lo} = \text{MUX}_{4:1}(I_0 \ldots I_3;\, S_1 S_0), \qquad Y_{hi} = \text{MUX}_{4:1}(I_4 \ldots I_7;\, S_1 S_0) $$

$$ Y = \overline{S_2}\,Y_{lo} + S_2\,Y_{hi} $$

Simulate with `iverilog -o sim tb.v design.v mux_4to1.v mux_2to1.v && vvp sim`. The testbench sweeps all 2048 combinations of select and data bits.
