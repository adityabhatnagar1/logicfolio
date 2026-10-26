// Compares two 2-bit numbers using gate equations and flags greater-than, equal, or less-than.
module comparator_2bit (
    input  wire [1:0] a,
    input  wire [1:0] b,
    output wire       gt,
    output wire       eq,
    output wire       lt
);
    wire e1 = ~(a[1] ^ b[1]);
    wire e0 = ~(a[0] ^ b[0]);

    assign gt = (a[1] & ~b[1]) | (e1 & a[0] & ~b[0]);
    assign eq = e1 & e0;
    assign lt = (~a[1] & b[1]) | (e1 & ~a[0] & b[0]);
endmodule