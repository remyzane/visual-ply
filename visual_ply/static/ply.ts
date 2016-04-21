/// <reference path="libs/jquery.d.ts" />
/// <reference path="libs/d3.d.ts" />

function do_load() {

    //console.log(JSON.stringify(root_node, null, 4));

    var ply = new AstTree();
}



function get_node_data(node_name) {
    var data = null;
    $.ajax({
        url: '/ply?node=' + node_name,
        type: 'GET',
        async: false,
        dataType: 'json',
        timeout: 3000,
        success: function (_data, textStatus, jqXHR) {
            data = _data;
        },
        error: function (xhr, status, error) {
            alert('Can not access API [ /ply?node=xxx ]');
            return;
        }
    });
    return data;
}


 function getLeafCount(_) {
     if (_.children.length == 0) {
         return 1;
     } else {
         var abc = _.children.map(getLeafCount);
         return abc.reduce(
             function (a, b) {
                 return a + b;
             }
         );
     }
}


class Ast {
    constructor(public id,
                public name,
                public px = 0,
                public py = 0,
                //public width = 1,
                public children: any = [],
                public parent: any = {id: null, px: null, py: null}) {
    }
}


class AstTree {
    serial = 1;
    ast = null;
    vRad = 12;
    node_width = 85;
    tier_height = 70;
    constructor() {
        var root_data = get_node_data('__root__');
        this.ast = new Ast(0, root_data.name, 800, 30);
        //console.log('aaa');
        //console.log(this.ast);
        this.bind_root_event();

        var id = this.serial++;
        var ast = new Ast(id, root_data.name);
        this.addAst(null, ast);
        console.log(root_data);
        for (var children_data of root_data.children ){
            console.log(children_data);
            var children = new Ast(0, children_data.name);
            this.addChildren(ast, children);
        }
    }

    bind_root_event() {
        d3.select("#treesvg").append('g').attr('id', 'g_circles').selectAll('circle').data(this.getVertices()).enter()
            .append('circle').attr('r', this.vRad)
            .on('click', function (d) {
                return _tree.addChildren(d);
            });

        var _tree = this;
        d3.select("#treesvg").append('g').attr('id', 'g_labels').selectAll('text').data(this.getVertices()).enter()
            .append('text')
            .on('click', function (d) {
                return _tree.addChildren(d);
            });
    }

    getVertices() {
        var v = [];
        function _getVertices(t) {
            //v.push({id: t.id, name: t.name, px: t.px, py: t.py, parent: parent});
            v.push(t);
            //console.log(t);
            for (var d of t.children ) {
                _getVertices(d);
            }
        }
        _getVertices(this.ast);
        return v.sort(
            function (a, b) {
                return a.id - b.id;
            }
        );
    }

    getEdges() {
        var e = [];

        function _getEdges(_) {
            for (var children of _.children) {
                e.push(children);
                _getEdges(children);
            }
        }

        _getEdges(this.ast);
        return e.sort(function (a, b) { return a.id - b.id; });
    }

    addChildren(parent) {
        var node = get_node_data(parent.name);

        var id = this.serial++;
        var ast = new Ast(id, node.name);

        this.addAst(parent, ast);
    }

    addAst(parent, c_ast) {
        if (parent) {
            c_ast.parent = {id: parent.id, px: parent.px, py: parent.py};
        }
        function _add(ast) {
            if (ast.id == c_ast.parent.id) {
                ast.children.push(c_ast);
                return true;
            }
            for (var children of ast.children) {
                if (_add(children)){
                    return true;
                }
            }
            return false;
        }

        // ****************************************************
        _add(this.ast);
        this.reposition(this.ast);
        // ****************************************************

        this.redraw();
    }

    redraw() {
        var edges = d3.select("#g_lines").selectAll('line').data(this.getEdges());
        var _tree = this;
        edges.transition().duration(500)
            .attr('x1', function (d) { return d.parent.px; })
            .attr('y1', function (d) { return d.parent.py; })
            .attr('x2', function (d) { return d.px; })
            .attr('y2', function (d) { return d.py; });

        edges.enter().append('line')
            .attr('x1', function (d) { console.log(d.parent); return d.parent.px; })
            .attr('y1', function (d) { return d.parent.py; })
            .attr('x2', function (d) { return d.px; })
            .attr('y2', function (d) { return d.py; });


        var circles = d3.select("#g_circles").selectAll('circle').data(this.getVertices());

        circles.transition().duration(500)
            .attr('cx', function (d) { return d.px; })
            .attr('cy', function (d) { return d.py; });

        circles.enter().append('circle')
            .attr('r', this.vRad)
            .attr('cx', function (d) { return d.px; })
            .attr('cy', function (d) { return d.py; })
            .on('click', function (d) { return _tree.addChildren(d); });

        //d3.select("#treesvg").append('rect').attr('width', 50).attr('x', function (d) {
        //    return d.px;
        //}).attr('y', 110);

        var labels = d3.select("#g_labels").selectAll('text').data(this.getVertices());

        labels.text(function (d) { return d.name; })
            .transition().duration(500)
            .attr('x', function (d) { return d.px; })
            .attr('y', function (d) { return d.py + 5; });

        labels.enter().append('text')
            .text(function (d) { return d.name; })
            .attr('x', function (d) { return d.px; })
            .attr('y', function (d) { return d.py + 5; })
            .on('click', function (d) { return _tree.addChildren(d); });
    }

    reposition(ast) {
        var lC = getLeafCount(ast), left = ast.px - this.node_width * (lC - 1) / 2;
        for (var d of ast.children) {
            var width = this.node_width * getLeafCount(d);
            left += width;
            d.px = left - (width + this.node_width) / 2;
            d.py = ast.py + this.tier_height;
            this.reposition(d);
        }
    }
}



        //d3.select("#treesvg").append('rect').attr('width', 50).attr('x', 600).attr('y', 100);
        //d3.select("#treesvg").append('g').attr('id', 'g_rects').selectAll('rect').data(tree.getVertices()).enter()
        //    .append('rect').attr('cx', function (d) {
        //    return d.px;
        //})  .attr('cy', function (d) {
        //    return d.py;
        //}).attr('width', vRad).attr('height', vRad)

        //var aaa = [{
        //    "v": 0,
        //    "l": root_node.name,
        //    "p": {
        //        "x": 800,
        //        "y": 30
        //    },
        //    "f": {}
        //}];
        ////