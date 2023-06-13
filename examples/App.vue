<template>
  <div class="container text-center mt-5 mb-5">
    <h1 class="mt-5 fw-bolder text-success">Student's Database</h1>
    <div class="table-responsive my-5">
      <!-- The table component -->
      {{ counter === 0 ? 'First render' : 'This keeps re render!' }}
      <Table :fields="fields" :studentData="studentData"></Table>
    </div>
  </div>
</template>

<script>
import Table from './Table.vue'

export default {
  name: 'App',
  components: {
    Table,
  },
  setup() {
    const studentData = [
      {
        ID: '01',
        Name: 'Abiola Esther',
        Course: 'Computer Science',
        Gender: 'Female',
        Age: '17',
      },
      {
        ID: '02',
        Name: 'Robert V. Kratz',
        Course: 'Philosophy',
        Gender: 'Male',
        Age: '19',
      },
      {
        ID: '03',
        Name: 'Kristen Anderson',
        Course: 'Economics',
        Gender: 'Female',
        Age: '20',
      },
      {
        ID: '04',
        Name: 'Adam Simon',
        Course: 'Food science',
        Gender: 'Male',
        Age: '21',
      },
      {
        ID: '05',
        Name: 'Daisy Katherine',
        Course: 'Business studies',
        Gender: 'Female',
        Age: '22',
      },
    ]

    const fields = ['ID', 'Name', 'Course', 'Gender', 'Age']

    return { studentData, fields }
  },

  data() {
    return {
      intervalId: null,
      counter: 0,
    }
  },

  created() {
    this.intervalId = setInterval(() => {
      this.counter++
    }, 1000)
  },

  beforeDestroy() {
    clearInterval(this.intervalId)
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
