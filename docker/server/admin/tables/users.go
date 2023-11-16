package tables

import (
	"errors"
	"github.com/GoAdminGroup/go-admin/context"
	"github.com/GoAdminGroup/go-admin/modules/db"
	form2 "github.com/GoAdminGroup/go-admin/plugins/admin/modules/form"
	"github.com/GoAdminGroup/go-admin/plugins/admin/modules/table"
	"github.com/GoAdminGroup/go-admin/template/types/form"
	"golang.org/x/crypto/bcrypt"
)

func GetUsersTable(ctx *context.Context) table.Table {
	users := table.NewDefaultTable(table.DefaultConfigWithDriverAndConnection("postgresql", "gbajs3"))

	info := users.GetInfo()

	info.AddField("ID", "id", db.Serial)
	info.AddField("Username", "username", db.Text).
		FieldFilterable().
		FieldSortable().
		FieldEditAble()

	info.SetTable("users").SetTitle("gbajs3 users").SetDescription("gbajs3 users")

	formList := users.GetForm()
	formList.AddField("Username", "username", db.Text, form.Text)
	formList.AddField("Password", "password", db.Text, form.Password).
		FieldHideWhenUpdate()
	formList.AddField("Password Confirm", "password_confirm", db.Text, form.Password).
		FieldHideWhenUpdate()

	formList.SetTable("users").SetTitle("gbajs3 users").SetDescription("gbajs3 users")

	formList.SetPostValidator(func(values form2.Values) error {
		if values.IsEmpty("username", "password", "password_confirm") {
			return errors.New("username and password can not be empty")
		}

		password := values.Get("password")

		if password != values.Get("password_confirm") {
			return errors.New("password does not match")
		}

		return nil
	})

	formList.SetPreProcessFn(func(values form2.Values) form2.Values {
		password := values.Get("password")
		pass_hash := encodePassword([]byte(password))

		values.Add("pass_hash", pass_hash)

		return values
	})

	detail := users.GetDetail()

	detail.AddField("ID", "id", db.Int8)
	detail.AddField("Username", "username", db.Text)
	detail.AddField("Storage Dir", "storage_dir", db.UUID)

	detail.SetTable("users").SetTitle("users").SetDescription("gbajs3 users")

	return users
}

// -------------------------
// helper functions
// -------------------------

func encodePassword(pwd []byte) string {
	hash, err := bcrypt.GenerateFromPassword(pwd, bcrypt.DefaultCost)
	if err != nil {
		return ""
	}
	return string(hash)
}
