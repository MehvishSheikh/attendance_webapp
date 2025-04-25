#     from . import crud
#   File "C:\Users\mehvi\AppData\Local\Programs\Python\Python313\Lib\site-packages\sqlalchemy\sql\crud.py", line 34, in <module>
#     from . import dml
#   File "C:\Users\mehvi\AppData\Local\Programs\Python\Python313\Lib\site-packages\sqlalchemy\sql\dml.py", line 34, in <module>
#     from . import util as sql_util
#   File "C:\Users\mehvi\AppData\Local\Programs\Python\Python313\Lib\site-packages\sqlalchemy\sql\util.py", line 46, in <module>
#     from .ddl import sort_tables as sort_tables  # noqa: F401
#     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#   File "C:\Users\mehvi\AppData\Local\Programs\Python\Python313\Lib\site-packages\sqlalchemy\sql\ddl.py", line 30, in <module>
#     from .elements import ClauseElement
#   File "C:\Users\mehvi\AppData\Local\Programs\Python\Python313\Lib\site-packages\sqlalchemy\sql\elements.py", line 808, in
#  <module>
#     class SQLCoreOperations(Generic[_T_co], ColumnOperators, TypingOnly):
#     ...<472 lines>...
#                 ...
#   File "C:\Users\mehvi\AppData\Local\Programs\Python\Python313\Lib\typing.py", line 1257, in _generic_init_subclass       
#     super(Generic, cls).__init_subclass__(*args, **kwargs)
#     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^
#   File "C:\Users\mehvi\AppData\Local\Programs\Python\Python313\Lib\site-packages\sqlalchemy\util\langhelpers.py", line 1981, in __init_subclass__
#     raise AssertionError(
#     ...<2 lines>...
#     )
# AssertionError: Class <class 'sqlalchemy.sql.elements.SQLCoreOperations'> directly inherits TypingOnly but has additional attributes {'__firstlineno__', '__static_attributes__'}.