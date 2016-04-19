/// <reference path="libs/jquery.d.ts" />
/// <reference path="libs/d3.d.ts" />

function do_load() {

    var root_node = get_node_data('__root__');
    //console.log(JSON.stringify(root_node, null, 4));

    var ply = new AstTree(root_node);
}


class Ast {
    constructor(public id,
                public name,
                public px = 0,
                public py = 0,
                //public width = 1,
                public children = [],
                public parent = {}) {
    }
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


class AstTree {
    serial = 1;
    ast = new Ast(0, 'root');  // {id: 0, children: []};
    vRad = 12;
    node_width = 60;
    tier_height = 70;

    constructor(public root_node) {
        this.ast.name = root_node.name;
        this.ast.px = 800;
        this.ast.py = 30;
        this.initialize()
    }

    initialize() {
        d3.select("#treesvg").append('g').attr('id', 'g_circles').selectAll('circle').data(this.getVertices()).enter()
            .append('circle').attr('r', this.vRad)
            .on('click', function (d) {
                return this.addLeaf(d.id);
            });

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
        var _tree = this;
        d3.select("#treesvg").append('g').attr('id', 'g_labels').selectAll('text').data(this.getVertices()).enter()
            .append('text')
            .on('click', function (d) {
                return _tree.addLeaf(d.id);
            });

        //tree.addLeaf(0);
        this.addLeaf(0);
        this.addLeaf(0);
        //redraw();

    }

    getVertices() {
        var v = [];
        function _getVertices(t, parent) {
            v.push({id: t.id, name: t.name, px: t.px, py: t.py, parent: parent});
            for (var d of t.children ) {
                _getVertices(d, {id: t.id, px: t.px, py: t.py});
            }
        }
        _getVertices(this.ast, {});
        return v.sort(
            function (a, b) {
                return a.id - b.id;
            }
        );
    }

    getEdges() {
        var e = [];

        function _getEdges(_) {
            for (var d of _.children) {
                e.push({v1: _.id, l1: _.name, p1x: _.px, p1y: _.py, v2: d.id, l2: d.name, p2x: d.px, p2y: d.py});
            }
            _.children.forEach(_getEdges);
        }

        _getEdges(this.ast);
        return e.sort(function (a, b) {
            return a.v2 - b.v2;
        });
    }

    addLeaf(_) {
        var node = get_node_data('__root__');
        var children = new Ast(this.serial++, node.name);
        function _addLeaf(ast) {
            if (ast.id == _) {
                ast.children.push(children);
                return;
            }
            ast.children.forEach(_addLeaf);
        }

        // ****************************************************
        _addLeaf(this.ast);
        this.reposition(this.ast);
        // ****************************************************

        this.redraw();
    }

    redraw() {
        var edges = d3.select("#g_lines").selectAll('line').data(this.getEdges());
        var _tree = this;
        edges.transition().duration(500)
            .attr('x1', function (d) {
                return d.p1x;
            }).attr('y1', function (d) {
                return d.p1y;
            })
            .attr('x2', function (d) {
                return d.p2x;
            }).attr('y2', function (d) {
            return d.p2y;
        });

        edges.enter().append('line')
            .attr('x1', function (d) {
                return d.p1x;
            }).attr('y1', function (d) {
                return d.p1y;
            })
            .attr('x2', function (d) {
                return d.p1x;
            }).attr('y2', function (d) {
                return d.p1y;
            })
            .transition().duration(500)
            .attr('x2', function (d) {
                return d.p2x;
            }).attr('y2', function (d) {
            return d.p2y;
        });

        console.log(JSON.stringify(this.getVertices(), null, 4));

        var circles = d3.select("#g_circles").selectAll('circle').data(this.getVertices());

        circles.transition().duration(500).attr('cx', function (d) {
            return d.px;
        }).attr('cy', function (d) {
            return d.py;
        });

        circles.enter().append('circle').attr('cx', function (d) {
            return d.parent.px;
        }).attr('cy', function (d) {
            return d.parent.py;
        }).attr('r', this.vRad)
            .on('click', function (d) {
                return _tree.addLeaf(d.id);
            })
            .transition().duration(500).attr('cx', function (d) {
            return d.px;
        }).attr('cy', function (d) {
            return d.py;
        });

        //d3.select("#treesvg").append('rect').attr('width', 50).attr('x', function (d) {
        //    return d.px;
        //}).attr('y', 110);

        var labels = d3.select("#g_labels").selectAll('text').data(this.getVertices());

        labels.text(function (d) {
            return d.name;
        }).transition().duration(500)
            .attr('x', function (d) {
                return d.px;
            }).attr('y', function (d) {
            return d.py + 5;
        });

        labels.enter().append('text').attr('x', function (d) {
            return d.parent.px;
        }).attr('y', function (d) {
                return d.parent.py + 5;
            })
            .text(function (d) {
                return d.name;
            }).on('click', function (d) {
                return _tree.addLeaf(d.id);
            })
            .transition().duration(500)
            .attr('x', function (d) {
                return d.px;
            }).attr('y', function (d) {
            return d.py + 5;
        });
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

