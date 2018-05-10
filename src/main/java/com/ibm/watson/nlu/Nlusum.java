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

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Version;
import javax.persistence.Table;

import lombok.Data;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * @author Greg Turnquist
 */
// tag::code[]
@Data
@Entity
@Table(name = "Nlusum")
public class Nlusum {

	private @Id @GeneratedValue Long id;
//	private String filename;
	private String item;
	private String itemtext;
	private String type;
	private Double relevance;
	private int count;
	private int year;
	private Double sentiment;
	private Double anger;
	private Double fear;
	private Double joy;
	private Double sadness;
	private Double disgust;

//	private @Version @JsonIgnore Long version;

	private Nlusum() {}


	public Nlusum(String item, String itemtext, String type, Double relevance, Integer count, Integer year, Double sentiment, Double anger, Double fear, Double joy, Double sadness, Double disgust) {

		this.item = item;
		this.itemtext = itemtext;
		this.type = type;
		this.relevance = relevance;
		this.count = count;
		this.year = year;
		this.sentiment = sentiment;
		this.anger = anger;
		this.fear = fear;
		this.joy = joy;
		this.sadness = sadness;
		this.disgust = disgust;
	}
}
// end::code[]
