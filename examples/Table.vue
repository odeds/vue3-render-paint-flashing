<template>
  <div class="searchBar">
    <!-- Filter Search -->
    <div class="input-group mb-5">
      <input
        type="search"
        class="form-control"
        v-model="searchQuery"
        placeholder="Student's Name"
        aria-label="Recipient's username"
        aria-describedby="button-addon2"
      />
    </div>
  </div>

  <table id="tableComponent" class="table table-bordered table-striped">
    <caption>
      A Responsive, Accessible Table Component
    </caption>
    <thead>
      <tr>
        <!-- loop through each value of the fields to get the table header -->
        <th v-for="field in fields" :key="field" @click="sortTable(field)">
          {{ field }}
          <i class="bi bi-sort-alpha-down" aria-label="Sort Icon"></i>
        </th>
      </tr>
    </thead>
    <tbody>
      <!-- Loop through the list get the each student data -->
      <tr v-for="item in filteredList" :key="item">
        <td v-for="field in fields" :key="field">{{ item[field] }}</td>
      </tr>
    </tbody>
  </table>
</template>
<script>
//@ts-nocheck
function sortBy(collection, iteratees) {
  return collection.sort((a, b) => {
    for (let iteratee of iteratees) {
      let aValue = typeof iteratee === 'function' ? iteratee(a) : a[iteratee]
      let bValue = typeof iteratee === 'function' ? iteratee(b) : b[iteratee]

      if (aValue < bValue) {
        return -1
      }
      if (aValue > bValue) {
        return 1
      }
    }
    return 0
  })
}

export default {
  name: 'TableComponent',
  props: {
    studentData: {
      type: Array,
    },
    fields: {
      type: Array,
    },
  },

  data() {
    return {
      sort: false,
      updatedList: [],
      searchQuery: '',
    }
  },

  methods: {
    sortTable(col) {
      this.sort = true
      this.updatedList = sortBy(this.$props.studentData, col)
    },
  },

  computed: {
    sortedList() {
      if (this.sort) {
        return this.updatedList
      } else {
        return this.$props.studentData
      }
    },
    filteredList() {
      return this.sortedList.filter((product) => {
        return (
          product.Name.toLowerCase().indexOf(this.searchQuery.toLowerCase()) !=
          -1
        )
      })
    },
  },
}
</script>
<style scoped>
table th:hover {
  background: #f2f2f2;
}
</style>
