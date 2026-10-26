A 16:1 multiplexer uses four select lines to pass one of sixteen data inputs through to the output.

It is the same trick again: two 8:1 multiplexers handle the lower and upper eight inputs, and a final 2:1 multiplexer, steered by S3, picks between them. Four 4:1 multiplexers feeding a 4:1 would work equally well.

$$ Y_{lo} = \text{MUX}_{8:1}(I_0 \ldots I_7;\, S_2 S_1 S_0), \qquad Y_{hi} = \text{MUX}_{8:1}(I_8 \ldots I_{15};\, S_2 S_1 S_0) $$

$$ Y = \overline{S_3}\,Y_{lo} + S_3\,Y_{hi} $$

Each doubling of inputs costs one extra select line and one extra 2:1 stage, so the design grows by a fixed step instead of being redrawn from scratch. Reusing the same small block keeps the layout regular and the pin count low, and a tool can optimise and verify one tested cell once.

Simulate with `iverilog -o sim tb.v design.v mux_8to1.v mux_4to1.v mux_2to1.v && vvp sim`. The testbench visits all 16 select values with a single 1 and a single 0 walked across the data inputs.
