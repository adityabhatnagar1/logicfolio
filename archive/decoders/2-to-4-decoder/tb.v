`timescale 1ns/1ps

module tb_decoder_2to4;
    reg        en;
    reg  [1:0] a;
    wire [3:0] y;
    reg  [3:0] expected;
    integer i, errors;

    decoder_2to4 dut (
        .en(en),
        .a(a),
        .y(y)
    );

    initial begin
        $dumpfile("decoder_2to4.vcd");
        $dumpvars(0, tb_decoder_2to4);
        errors = 0;
        for (i = 0; i < 8; i = i + 1) begin
            {en, a} = i[2:0];
            #10;
            expected = en ? (4'b0001 << a) : 4'b0000;
            if (y !== expected) begin
                errors = errors + 1;
                $display("FAIL en=%b a=%b y=%b expected=%b", en, a, y, expected);
            end
        end
        $display("decoder_2to4: %0d errors", errors);
        $finish;
    end
endmodule
