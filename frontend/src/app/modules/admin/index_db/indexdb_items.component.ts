import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TodoItem, TodoList } from '@ih-app/models/IndexDb';
import { AuthService } from '@ih-app/services/auth.service';
import { IndexDbService } from '@ih-src/app/services/index-db/index-db.service';
import { notNull } from '@ih-app/shared/functions';

import { liveQuery } from 'dexie';

@Component({
  templateUrl: './indexdb_items.component.html'
})
export class IndexDbItemListComponent implements OnInit {
  listForm!: FormGroup;
  itemsForm!: FormGroup;


  constructor(private db: IndexDbService, private route: ActivatedRoute, private router: Router, private authService: AuthService) { }


  ngOnInit() {
    this.listForm = this.createListFormGroup();
    this.itemsForm = this.createItemsFormGroup();
  }

  notNull(data: any) {
    return notNull(data);
  }

  createListFormGroup(): FormGroup {
    return new FormGroup({
      id: new FormControl(null),
      listName: new FormControl(null, [
        Validators.required,
        Validators.minLength(5),
      ])
    });
  }

  createItemsFormGroup(): FormGroup {
    return new FormGroup({
      id: new FormControl(null),
      itemName: new FormControl(null, [
        Validators.required,
        Validators.minLength(5),
      ]),
      todoListId: new FormControl(null),
    });
  }

  todoLists$ = liveQuery(() => this.db.todoLists.toArray());
  todoItems$ = liveQuery(() => this.listTodoItems());
  todoListTable = this.db.todoLists;
  todoItemsTable = this.db.todoItems;


  addNewOrUpdateList() {
    const id = this.listForm.value.id;
    const list:TodoList = { id: id, title: this.listForm.value.listName };
    if (!this.notNull(id)) {
      this.db.create(this.todoListTable, list).then((v) => this.clearOrEditListInput());
    } else {
      this.db.update(this.todoListTable, list).then((v) => this.clearOrEditListInput());
    }
  }

  async deleteList(list: TodoList) {
    await this.db.deleteOne(this.todoListTable, list.id).then((v) => this.clearOrEditListInput());
  }

  editList(list: TodoList) {
    this.clearOrEditListInput(list)
  }

  identifyList(index: number, list: TodoList) {
    return `${list!.id}${list!.title}`;
  }

  clearOrEditListInput(list: any = null) {
    this.listForm.setValue({
      id: this.notNull(list) ? list.id : null,
      listName: this.notNull(list) ? list.title : null
    });
  }

  // #####################################################################


  async listTodoItems() {
    return await this.db.todoItems
      // .where({
      //   todoListId: this.todoList!.id,
      // })
      .toArray();
  }

  async addNewOrUpdateItem() {
    const id = this.itemsForm.value.id;
    const todoListId = this.itemsForm.value.todoListId || (await this.db.getlast(this.todoItemsTable))?.id || 0;
    var items:TodoItem = { id:id, title: this.itemsForm.value.itemName, todoListId:todoListId };
    if (!this.notNull(id)) {
      this.db.create(this.todoItemsTable, items).then((v) => this.clearOrEditItemInput());
    } else {
      this.db.update(this.todoItemsTable, items).then((v) => this.clearOrEditItemInput());
    }
  }

  deleteItem(item: TodoItem) {
    this.db.deleteOne(this.todoItemsTable, item.id).then((v) => this.clearOrEditItemInput());
  }

  editItem(item: TodoItem) {
    this.clearOrEditItemInput(item);
  }

  clearOrEditItemInput(item: any = null) {
    this.itemsForm.setValue({
      id: this.notNull(item) ? item.id : null,
      itemName: this.notNull(item) ? item.title : null,
      todoListId: this.notNull(item) ? item.todoListId : null
    });
  }




}
