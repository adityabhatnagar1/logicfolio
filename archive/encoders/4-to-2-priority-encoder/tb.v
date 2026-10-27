`timescale 1ns/1ps

module tb_priority_encoder_4to2;
    reg  [3:0] d;
    wire [1:0] y;
    wire       v;
    reg  [2:0] expected;
    integer i, errors;

    priority_encoder_4to2 dut (
        .d(d),
        .y(y),
        .v(v)
    );

    initial begin
        $dumpfile("priority_encoder_4to2.vcd");
        $dumpvars(0, tb_priority_encoder_4to2);
        errors = 0;
        for (i = 0; i < 16; i = i + 1) begin
            d = i[3:0];
            #10;
            if (d[3])      expected = 3'b111;
            else if (d[2]) expected = 3'b110;
            else if (d[1]) expected = 3'b101;
            else if (d[0]) expected = 3'b100;
            else           expected = 3'b000;
            if ({v, y} !== expected) begin
                errors = errors + 1;
                $display("FAIL d=%b v/y=%b expected=%b", d, {v, y}, expected);
            end
        end
        $display("priority_encoder_4to2: %0d errors", errors);
        $finish;
    end
endmodule
