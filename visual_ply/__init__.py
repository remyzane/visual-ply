import string

random_number = 0
visual_ply = None


def code(name):
    global random_number
    random_number += 1
    return '%s_%d' % (name, random_number)


def width(name):
    # _width = 0
    # for _char in name:
    #     _width += 5.3 if (_char in string.lowercase) else 10.5
    # return int(_width)
    return len(name) * 9 + 2


def get_visual_ply(lexer, parser, root_node):
    global visual_ply
    if not visual_ply:
        visual_ply = VisualPly(lexer, parser, root_node)
    return visual_ply


class VisualPly(object):
    def __init__(self, lexer, parser, root_node):
        self.lexer = lexer
        self.parser = parser
        self.root_node = root_node
        self.tokens = dict()
        self.productions = dict()
        # for token_str in lexer.lexretext[0][3:-1].split(')|(?P'):
        for token_str in lexer.lexstatere['INITIAL'][0][0].pattern[3:-1].split(')|(?P'):
            name, value = token_str[3:].split('>', 1)
            self.tokens[name] = value
        for production in parser.productions:
            if production.name not in self.productions:
                self.productions[production.name] = []
            self.productions[production.name].append({
                'func': production.func,
                # 'name': production.name,
                'str': production.str.split(' -> ')[1]
            })
            # print(dir(production))
            # print(production.len, production.str)

    def get_node(self, node_name):
        node_name = self.root_node if node_name == '__root__' else node_name

        childrens = []
        for production in self.productions.get(node_name):
            for name in production['str'].split():
                childrens.append({
                    'id': production['func'], 'name': name, 'width': width(name), 'children': []
                })

        return {'id': code(node_name), 'name': node_name, 'width': width(node_name), 'children': childrens[:]}

        # for token in self.tokens.items():
        #     print(token)

        # for name, production in self.productions.items():
        #     print('%s --------------------------' % name)
        #     for item in production:
        #         pass
        #         print(item['str'])
        # if data_type == 'menu':
        #     return {'aaa': 1}

