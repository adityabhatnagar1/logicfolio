// D flip-flop with synchronous reset: rst clears q to 0, but only on a rising clock edge.
module d_flip_flop_with_synchronous_reset (
    input  wire clk,
    input  wire rst,
    input  wire d,
    output reg  q
);
    always @(posedge clk)
        if (rst)
            q <= 1'b0;
        else
            q <= d;
endmodule
