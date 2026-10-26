`timescale 1ns/1ps

module tb_priority_encoder_8to3;
    reg  [7:0] d;
    wire [2:0] y;
    wire       v;
    reg  [3:0] expected;
    integer i, j, errors;

    priority_encoder_8to3 dut (
        .d(d),
        .y(y),
        .v(v)
    );

    initial begin
        $dumpfile("priority_encoder_8to3.vcd");
        $dumpvars(0, tb_priority_encoder_8to3);
        errors = 0;
        for (i = 0; i < 256; i = i + 1) begin
            d = i[7:0];
            #1;
            expected = 4'b0000;
            for (j = 0; j < 8; j = j + 1) begin
                if (d[j]) expected = {1'b1, j[2:0]};
            end
            if ({v, y} !== expected) begin
                errors = errors + 1;
                $display("FAIL d=%b v/y=%b expected=%b", d, {v, y}, expected);
            end
        end
        $display("priority_encoder_8to3: %0d errors", errors);
        $finish;
    end
endmodule
