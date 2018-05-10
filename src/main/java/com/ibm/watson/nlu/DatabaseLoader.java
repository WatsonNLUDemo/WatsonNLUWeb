/*
 * Copyright 2015 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.ibm.watson.nlu;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * @author Greg Turnquist
 */
// tag::code[]
@Component
public class DatabaseLoader implements CommandLineRunner {

	private final NluRepository Nrepository;
	private final NlusumRepository Nsumrepository;

	@Autowired
	public DatabaseLoader( NluRepository Nrepository,  NlusumRepository Nsumrepository) {

		this.Nrepository = Nrepository;
		this.Nsumrepository = Nsumrepository;
	}

	@Override
	public void run(String... strings) throws Exception {



/*		this.Erepository.save(new Employee("Frodo", "Baggins", "ring bearer"));
		this.Erepository.save(new Employee("Bilbo", "Baggins", "burglar"));
		this.Erepository.save(new Employee("Gandalf", "the Grey", "wizard"));
		this.Erepository.save(new Employee("Samwise", "Gamgee", "gardener"));
		this.Erepository.save(new Employee("Meriadoc", "Brandybuck", "pony rider"));
		this.Erepository.save(new Employee("Peregrin", "Took", "pipe smoker"));
		this.Erepository.save(new Employee("Jon", "Baggins", "ring bearer","item", "itemtext", "type", 1.32323, 5, 2016, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323));
		this.Erepository.save(new Employee("Bilbo", "Baggins", "burglar","item", "itemtext", "type", 1.32323, 5, 2016, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323));
		this.Erepository.save(new Employee("Gandalf", "the Grey", "wizard","item", "itemtext", "type", 1.32323, 5, 2016, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323));
		this.Erepository.save(new Employee("Samwise", "Gamgee", "gardener","item", "itemtext", "type", 1.32323, 5, 2016, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323));
		this.Erepository.save(new Employee("Meriadoc", "Brandybuck", "pony rider","item", "itemtext", "type", 1.32323, 5, 2016, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323));
		this.Erepository.save(new Employee("Peregrin", "Took", "pipe smoker","item", "itemtext", "type", 1.32323, 5, 2016, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323));

		this.Nrepository.save(new Nlu("Filename","item", "itemtext", "type", 1.32323, 5, 2016, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323));
		this.Nrepository.save(new Nlu("Filename","item", "itemtext", "type", 1.32323, 5, 2016, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323));
		this.Nrepository.save(new Nlu("Filename","item", "itemtext", "type", 1.32323, 5, 2016, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323));
		this.Nrepository.save(new Nlu("Filename","item", "itemtext", "type", 1.32323, 5, 2016, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323));
		this.Nrepository.save(new Nlu("Filename","item", "itemtext", "type", 1.32323, 5, 2016, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323));
		this.Nrepository.save(new Nlu("Filename","item", "itemtext", "type", 1.32323, 5, 2016, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323));


		this.Nsumrepository.save(new Nlusum("item", "itemtext", "type", 1.32323, 5, 2016, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323));
		this.Nsumrepository.save(new Nlusum("item", "itemtext", "type", 1.32323, 5, 2016, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323));
		this.Nsumrepository.save(new Nlusum("item", "itemtext", "type", 1.32323, 5, 2016, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323));
		this.Nsumrepository.save(new Nlusum("item", "itemtext", "type", 1.32323, 5, 2016, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323));
		this.Nsumrepository.save(new Nlusum("item", "itemtext", "type", 1.32323, 5, 2016, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323));
		this.Nsumrepository.save(new Nlusum("item", "itemtext", "type", 1.32323, 5, 2016, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323, 1.32323));
*/

	}
}
// end::code[]
