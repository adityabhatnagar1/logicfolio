// D flip-flop with enable: loads d on the rising clock edge only while en is high.
module d_flip_flop_with_enable (
    input  wire clk,
    input  wire en,
    input  wire d,
    output reg  q
);
    always @(posedge clk)
        if (en)
            q <= d;
endmodule
